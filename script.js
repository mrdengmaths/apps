// --- Constants ---
const TARGET_MAX_TIME = 30;
const MIN_TURNS = 3;
const MAX_TURNS = 7;
const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const MARGIN = { top: 60, right: 50, bottom: 70, left: 60 };
const GRAPH_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const GRAPH_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const HOME_DEST_BAR_HEIGHT = 50;
const COUNTDOWN_DURATION = 3;
const STATIONARY_RECORD_INTERVAL = 0.1;

// --- Helper Functions ---
const calculateSpeed = (p1, p2) => {
  if (!p1 || !p2 || p2.time === p1.time) return 0;
  return ((p2.distance - p1.distance) / (p2.time - p1.time)).toFixed(2);
};

const getGradientExplanation = (speed) => {
  const numericSpeed = parseFloat(speed);
  if (numericSpeed > 0.01) return `Positive gradient (${speed} m/s): Moving away from Home.`;
  if (numericSpeed < -0.01) return `Negative gradient (${speed} m/s): Moving towards Home.`;
  return `Zero gradient (${speed} m/s): Stationary.`;
};

const interpolateDistance = (data, time) => {
    if (!data || data.length === 0) return null;
    const exactMatch = data.find(p => p.time === time);
    if (exactMatch) return exactMatch.distance;
    const times = data.map(d => d.time);
    const index = d3.bisectLeft(times, time);
    if (index === 0) return data[0]?.distance ?? null;
    if (index >= data.length) return data[data.length - 1]?.distance ?? null;
    const p0 = data[index - 1];
    const p1 = data[index];
    if (!p0) return p1?.distance ?? null;
    if (!p1) return p0?.distance ?? null;
    if (p1.time === p0.time) return p0.distance;
    const tRatio = (time - p0.time) / (p1.time - p0.time);
    if (isNaN(tRatio) || !isFinite(tRatio)) return p0.distance;
    return p0.distance + tRatio * (p1.distance - p0.distance);
};

// --- Icon Replacements (Unicode/Text) ---
const PlayIcon = () => '►';
const RetryIcon = () => '↺';
const NewGraphIcon = () => '»';
const HelpIcon = () => '?';
const ChevronLeftIcon = () => '«';
const ChevronRightIcon = () => '»';
const PauseIcon = () => '❚❚';


// --- App Component ---
const App = () => {
  const [gameState, setGameState] = React.useState('idle');
  const [targetGraphData, setTargetGraphData] = React.useState([]);
  const [userGraphData, setUserGraphData] = React.useState([]);
  const [currentMaxDistance, setCurrentMaxDistance] = React.useState(100);
  const [stopwatchTime, setStopwatchTime] = React.useState(0);
  const [similarityScore, setSimilarityScore] = React.useState(0);
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [performanceMetrics, setPerformanceMetrics] = React.useState(null);
  const [bestScore, setBestScore] = React.useState(() => {
    return localStorage.getItem('bestScore') || 0;
  });
  const [countdownValue, setCountdownValue] = React.useState(COUNTDOWN_DURATION);
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [timelineValue, setTimelineValue] = React.useState(0);
  const [tooltip, setTooltip] = React.useState(null);
  const [playSuccessAnimation, setPlaySuccessAnimation] = React.useState(false);
  const [currentBarDirection, setCurrentBarDirection] = React.useState(null);

  const svgRef = React.useRef(null);
  const homeDestBarRef = React.useRef(null);
  const requestRef = React.useRef(null);
  const stopwatchStartRef = React.useRef(null);
  const lastCursorPositionRef = React.useRef({ x: 0, distance: 0 });
  
  const generateTargetGraph = React.useCallback(() => {
    let points = [{ time: 0, distance: 0, label: 'Start' }];
    let lastTime = 0;
    let lastDistance = 0;
    const graphSpecificMaxDistance = Math.floor(Math.random() * 101) + 50;
    setCurrentMaxDistance(graphSpecificMaxDistance);
    const numSegments = Math.floor(Math.random() * (MAX_TURNS - MIN_TURNS + 1)) + (MIN_TURNS + 1);
    let hasHorizontalSegment = false;
    const horizontalSegmentIndex = numSegments > 2 ? Math.floor(Math.random() * (numSegments - 2)) + 1 : -1;

    for (let i = 0; i < numSegments; i++) {
      let newTime, newDistance;
      const remainingTime = TARGET_MAX_TIME - lastTime;
      const timeStepDenominator = (numSegments - i);
      let timeStep = remainingTime / (timeStepDenominator > 0 ? timeStepDenominator : 1);
      if (i === horizontalSegmentIndex) {
        timeStep = Math.max(timeStep * 0.3, 2);
        timeStep = Math.min(timeStep, remainingTime * 0.5);
      }
      newTime = lastTime + timeStep * (0.6 + Math.random() * 0.4);
      newTime = Math.min(newTime, TARGET_MAX_TIME);
      if (i === numSegments - 1 && newTime < TARGET_MAX_TIME) newTime = TARGET_MAX_TIME;
      if (i === horizontalSegmentIndex) {
        newDistance = lastDistance;
        hasHorizontalSegment = true;
      } else {
        newDistance = Math.random() * graphSpecificMaxDistance;
      }
      if (i !== horizontalSegmentIndex && newTime - lastTime < 1.0 && Math.abs(newDistance - lastDistance) > graphSpecificMaxDistance / 1.2) {
        newDistance = lastDistance + (Math.random() - 0.5) * (graphSpecificMaxDistance / 2.5);
      }
      newDistance = Math.max(0, Math.min(graphSpecificMaxDistance, newDistance));
      if (newTime > lastTime + 0.05) {
        points.push({ time: newTime, distance: newDistance, label: `Pt ${i + 1}` });
        lastTime = newTime;
        lastDistance = newDistance;
      } else if (i === numSegments - 1 && points.length > 1) {
        points[points.length - 1].time = TARGET_MAX_TIME;
        points[points.length - 1].distance = newDistance;
      }
    }
    if (!hasHorizontalSegment && points.length > 3) {
      const idxToMakeHorizontal = Math.floor(points.length / 2);
      if (points[idxToMakeHorizontal + 1] && points[idxToMakeHorizontal]) {
        points[idxToMakeHorizontal + 1].distance = points[idxToMakeHorizontal].distance;
        if (points[idxToMakeHorizontal + 1].time <= points[idxToMakeHorizontal].time + 0.5) {
          points[idxToMakeHorizontal + 1].time = points[idxToMakeHorizontal].time + Math.max(1, (TARGET_MAX_TIME - points[idxToMakeHorizontal].time) * 0.1);
        }
      }
    }
    points = points.filter((point, index, self) => index === self.findIndex((p) => p.time === point.time)).sort((a, b) => a.time - b.time);
    if (points.length > 0 && points[points.length - 1].time < TARGET_MAX_TIME) {
      const finalDistance = Math.random() * graphSpecificMaxDistance;
      if (TARGET_MAX_TIME - points[points.length - 1].time > 0.1) {
        points.push({ time: TARGET_MAX_TIME, distance: finalDistance, label: 'End' });
      } else if (points.length > 0) {
        points[points.length - 1].time = TARGET_MAX_TIME;
        points[points.length - 1].label = 'End';
      }
    } else if (points.length > 0 && points[points.length - 1].time > TARGET_MAX_TIME) {
      points[points.length - 1].time = TARGET_MAX_TIME;
      points[points.length - 1].label = 'End';
    }
    if (points.length > 0) points[0].label = 'Start';
    if (points.length > 1 && points[points.length - 1].time === TARGET_MAX_TIME) points[points.length - 1].label = 'End';
    const processedPoints = points.map((p, i) => {
      if (i === 0) return { ...p, speed: 0 };
      const speed = calculateSpeed(points[i - 1], p);
      return { ...p, speed: parseFloat(speed) };
    });
    setTargetGraphData(processedPoints);
    setUserGraphData([]);
    setTimelineValue(0);
  }, []);

  const calculatePerformance = React.useCallback(() => {
    if (!userGraphData || userGraphData.length < 2 || !targetGraphData || targetGraphData.length < 2) {
      setSimilarityScore(0);
      setFeedbackMessage("Not enough data. Trace longer!");
      setPerformanceMetrics(null);
      return;
    }
    let sumSqDiff = 0;
    let count = 0;
    const timeStep = 0.1;
    const maxCompareTime = Math.min(userGraphData[userGraphData.length - 1]?.time || 0, TARGET_MAX_TIME);
    for (let t = 0; t <= maxCompareTime; t += timeStep) {
      const targetDist = interpolateDistance(targetGraphData, t);
      const userDist = interpolateDistance(userGraphData, t);
      if (targetDist !== null && userDist !== null) {
        sumSqDiff += Math.pow(targetDist - userDist, 2);
        count++;
      }
    }
    if (count === 0) {
      setSimilarityScore(0);
      setFeedbackMessage("Could not compare.");
      setPerformanceMetrics(null);
      return;
    }
    const meanSqDiff = sumSqDiff / count;
    const normalizedError = Math.sqrt(meanSqDiff) / currentMaxDistance;
    // Stricter similarity score calculation
    let score = Math.max(0, 100 * (1 - normalizedError * 1.5));
    score = Math.round(score);
    
    if(score > bestScore) {
        setBestScore(score);
        localStorage.setItem('bestScore', score);
    }
    
    setSimilarityScore(score);
    setPerformanceMetrics({
        user: {
            maxDist: Math.max(...userGraphData.map(p => p.distance)).toFixed(1),
            time: userGraphData[userGraphData.length-1].time.toFixed(1)
        },
        target: {
            maxDist: Math.max(...targetGraphData.map(p => p.distance)).toFixed(1),
            time: TARGET_MAX_TIME
        }
    });

    if (score >= 95) setFeedbackMessage("Incredible! A perfect match!");
    else if (score >= 85) setFeedbackMessage("Excellent Trace!");
    else if (score >= 70) setFeedbackMessage("Great job! Very close!");
    else if (score >= 50) setFeedbackMessage("Good effort! Keep practicing!");
    else setFeedbackMessage("Keep practicing to improve your score!");
  }, [userGraphData, targetGraphData, currentMaxDistance, bestScore]);

  const handleStopRecording = React.useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (gameState === 'recording') {
      setGameState('analysis');
      calculatePerformance();
      setPlaySuccessAnimation(true);
    }
  }, [gameState, calculatePerformance]);

  const updateGame = React.useCallback(() => {
    if (stopwatchStartRef.current === null) return;
    const elapsed = (Date.now() - stopwatchStartRef.current) / 1000;
    setStopwatchTime(elapsed);
    if (homeDestBarRef.current) {
      const barWidth = homeDestBarRef.current.offsetWidth;
      if (barWidth > 0) {
        const lastKnownDistance = lastCursorPositionRef.current.distance;
        setUserGraphData(prevData => {
          if (prevData.length === 0 || (elapsed - prevData[prevData.length - 1].time >= STATIONARY_RECORD_INTERVAL)) {
            const lastPoint = prevData[prevData.length - 1];
            if (!lastPoint || elapsed - lastPoint.time > 0.01 || Math.abs(lastKnownDistance - lastPoint.distance) > 0.001 * currentMaxDistance) {
              return [...prevData, { time: elapsed, distance: lastKnownDistance }];
            }
          }
          return prevData;
        });
      }
    }
    if (elapsed < TARGET_MAX_TIME) {
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      handleStopRecording();
    }
  }, [currentMaxDistance, handleStopRecording]);

  const handleStart = () => {
    setGameState('countdown');
    setCountdownValue(COUNTDOWN_DURATION);
    setUserGraphData([]);
    setStopwatchTime(0);
    setTimelineValue(0);
    setPlaySuccessAnimation(false);
    setPerformanceMetrics(null);
  };

  const handleMouseMoveOnBar = (event) => {
    if (gameState !== 'recording' || !homeDestBarRef.current) return;
    const barRect = homeDestBarRef.current.getBoundingClientRect();
    const cursorX = event.clientX;
    let relativeX = cursorX - barRect.left;
    relativeX = Math.max(0, Math.min(relativeX, barRect.width));
    const currentDistance = (relativeX / barRect.width) * currentMaxDistance;
    const elapsedTime = (Date.now() - stopwatchStartRef.current) / 1000;
    lastCursorPositionRef.current = { x: relativeX, distance: currentDistance };
    if (elapsedTime > TARGET_MAX_TIME) {
      handleStopRecording();
      return;
    }
    setUserGraphData(prevData => {
      const lastPoint = prevData[prevData.length - 1];
      if (!lastPoint || elapsedTime - lastPoint.time > 0.01) {
        return [...prevData, { time: elapsedTime, distance: currentDistance }];
      } else if (lastPoint && Math.abs(lastPoint.distance - currentDistance) > 0.001 * currentMaxDistance) {
        const newData = [...prevData];
        newData[newData.length - 1] = { ...lastPoint, distance: currentDistance };
        return newData;
      }
      return prevData;
    });
    if (Math.abs(currentDistance - currentMaxDistance) < (0.01 * currentMaxDistance) && relativeX / barRect.width > 0.98) {
      handleStopRecording();
    }
  };
  
  const handleRetry = () => {
    setGameState('idle');
    setUserGraphData([]);
    setStopwatchTime(0);
    setSimilarityScore(0);
    setFeedbackMessage('');
    setTimelineValue(0);
    setPlaySuccessAnimation(false);
    setPerformanceMetrics(null);
  };

  const handleNewGraph = () => {
    generateTargetGraph();
    handleRetry();
  };
  
  const toggleTutorial = () => setShowTutorial(!showTutorial);

  React.useEffect(() => { generateTargetGraph(); }, [generateTargetGraph]);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const xScale = d3.scaleLinear().domain([0, TARGET_MAX_TIME]).range([0, GRAPH_WIDTH]);
    const yScale = d3.scaleLinear().domain([0, currentMaxDistance]).range([GRAPH_HEIGHT, 0]);
    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
    g.append("g").attr("transform", `translate(0,${GRAPH_HEIGHT})`).call(d3.axisBottom(xScale).ticks(TARGET_MAX_TIME / 5))
      .append("text").attr("fill", "currentColor").attr("x", GRAPH_WIDTH / 2).attr("y", 35)
      .attr("text-anchor", "middle").attr("font-size", "14px").attr("class", "font-medium").text("Time (s)");
    g.append("g").call(d3.axisLeft(yScale).ticks(currentMaxDistance / 20))
      .append("text").attr("fill", "currentColor").attr("transform", "rotate(-90)")
      .attr("x", -GRAPH_HEIGHT / 2).attr("y", -45).attr("font-size", "14px")
      .attr("text-anchor", "middle").attr("class", "font-medium").text("Distance (m)");
    const lineGenerator = d3.line().x(d => xScale(d.time)).y(d => yScale(d.distance)).defined(d => d.time != null && d.distance != null && !isNaN(d.time) && !isNaN(d.distance));
    if (targetGraphData && targetGraphData.length > 0) {
      g.append("path").datum(targetGraphData.filter(d => d.time <= TARGET_MAX_TIME)).attr("fill", "none").attr("stroke", "hsl(210, 70%, 60%)").attr("stroke-width", 2.5).attr("d", lineGenerator);
      if (gameState === 'recording') {
        let activeSegment = null;
        for (let i = 0; i < targetGraphData.length - 1; i++) {
          if (stopwatchTime >= targetGraphData[i].time && stopwatchTime < targetGraphData[i + 1].time) {
            activeSegment = [targetGraphData[i], targetGraphData[i + 1]];
            break;
          }
        }
        if (!activeSegment && targetGraphData.length > 1 && stopwatchTime >= targetGraphData[targetGraphData.length - 1].time) {
          activeSegment = [targetGraphData[targetGraphData.length - 2], targetGraphData[targetGraphData.length - 1]];
        }
        if (activeSegment) {
          g.append("path").datum(activeSegment).attr("fill", "none").attr("stroke", "blue").attr("stroke-width", 4.5).attr("d", lineGenerator);
        }
      }
      g.selectAll(".target-point").data(targetGraphData.filter(d => d.time <= TARGET_MAX_TIME)).enter().append("circle").attr("class", "target-point").attr("cx", d => xScale(d.time)).attr("cy", d => yScale(d.distance)).attr("r", 4).attr("fill", "blue");
      if (gameState === 'analysis') {
        for (let i = 0; i < targetGraphData.length - 1; i++) {
          if (targetGraphData[i + 1].time > TARGET_MAX_TIME) continue;
          const segment = [targetGraphData[i], targetGraphData[i + 1]];
          g.append("path").datum(segment).attr("fill", "none").attr("stroke", "transparent").attr("stroke-width", 15).attr("d", lineGenerator).style("cursor", "help")
            .on("mouseover", (event) => { setTooltip({ x: event.clientX, y: event.clientY, content: getGradientExplanation(segment[1].speed), segmentIndex: i }); })
            .on("mouseout", () => setTooltip(null));
        }
      }
    }
    if (userGraphData && userGraphData.length > 0) {
      g.append("path").datum(userGraphData.filter(d => d.time <= TARGET_MAX_TIME)).attr("fill", "none").attr("stroke", "red").attr("stroke-width", 2.5).attr("d", lineGenerator);
    }
    if (gameState === 'analysis' && userGraphData && userGraphData.length > 1 && targetGraphData && targetGraphData.length > 1) {
      const areaGenerator = d3.area().x(d => xScale(d.time)).y0(d => yScale(d.targetDistance)).y1(d => yScale(d.userDistance)).defined(d => d.time != null && d.targetDistance != null && d.userDistance != null && !isNaN(d.targetDistance) && !isNaN(d.userDistance));
      const comparisonData = [];
      const maxTimeUser = userGraphData[userGraphData.length - 1]?.time || 0;
      const maxTimeTarget = targetGraphData[targetGraphData.length - 1]?.time || 0;
      const effectiveMaxComparisonTime = Math.min(TARGET_MAX_TIME, maxTimeUser);
      const timePoints = new Set();
      targetGraphData.forEach(p => { if (p.time <= Math.min(maxTimeTarget, TARGET_MAX_TIME)) timePoints.add(p.time); });
      userGraphData.forEach(p => { if (p.time <= effectiveMaxComparisonTime) timePoints.add(p.time); });
      const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);
      sortedTimePoints.forEach(t => {
        const targetDist = interpolateDistance(targetGraphData, t);
        const userDist = interpolateDistance(userGraphData, t);
        if (targetDist != null && userDist != null && t <= effectiveMaxComparisonTime) {
          comparisonData.push({ time: t, targetDistance: targetDist, userDistance: userDist });
        }
      });
      if (comparisonData.length > 1) {
        g.append("path").datum(comparisonData).attr("fill", "rgba(255, 100, 100, 0.25)").attr("stroke", "none").attr("d", areaGenerator);
      }
    }
    if (gameState === 'analysis' && timelineValue > 0 && timelineValue <= TARGET_MAX_TIME) {
      const timelineX = xScale(timelineValue);
      g.append("line").attr("id", "timelineMarker").attr("x1", timelineX).attr("x2", timelineX).attr("y1", 0).attr("y2", GRAPH_HEIGHT).attr("stroke", "purple").attr("stroke-width", 1.5).attr("stroke-dasharray", "4");
      const targetDistAtTimeline = interpolateDistance(targetGraphData, timelineValue);
      const userDistAtTimeline = interpolateDistance(userGraphData, timelineValue);
      g.selectAll(".timeline-value-text").remove();
      if (targetDistAtTimeline !== null) {
        g.append("text").attr("class", "timeline-value-text").attr("x", timelineX + 5).attr("y", yScale(targetDistAtTimeline) - 5).attr("fill", "blue").attr("font-size", "12px").text(`T: ${targetDistAtTimeline.toFixed(1)}m`);
      }
      if (userDistAtTimeline !== null) {
        g.append("text").attr("class", "timeline-value-text").attr("x", timelineX + 5).attr("y", yScale(userDistAtTimeline) + (userDistAtTimeline < targetDistAtTimeline ? 15 : -5)).attr("fill", "red").attr("font-size", "12px").text(`U: ${userDistAtTimeline.toFixed(1)}m`);
      }
    }
  }, [targetGraphData, userGraphData, gameState, currentMaxDistance, timelineValue, stopwatchTime]);

  React.useEffect(() => {
    if (gameState === 'countdown' && countdownValue > 0) {
      const timer = setTimeout(() => setCountdownValue(countdownValue - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdownValue === 0) {
      setGameState('recording');
      stopwatchStartRef.current = Date.now();
      lastCursorPositionRef.current = { x: 0, distance: 0 };
      setUserGraphData([{ time: 0, distance: 0 }]);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [gameState, countdownValue, updateGame]);
  
  React.useEffect(() => {
    if (playSuccessAnimation) {
      const timer = setTimeout(() => setPlaySuccessAnimation(false), 600);
      return () => clearTimeout(timer);
    }
  }, [playSuccessAnimation]);

  React.useEffect(() => {
    if (gameState === 'recording' && targetGraphData && targetGraphData.length > 0) {
      const currentTime = stopwatchTime;
      let direction = null;
      let foundSegment = false;
      for (let i = 0; i < targetGraphData.length - 1; i++) {
        if (currentTime >= targetGraphData[i].time && currentTime < targetGraphData[i + 1].time) {
          if (targetGraphData[i + 1].speed > 0.01) direction = 'right';
          else if (targetGraphData[i + 1].speed < -0.01) direction = 'left';
          else direction = 'stationary';
          foundSegment = true;
          break;
        }
      }
      if (!foundSegment && targetGraphData.length > 0) {
        const lastPoint = targetGraphData[targetGraphData.length - 1];
        if (lastPoint.speed > 0.01) direction = 'right';
        else if (lastPoint.speed < -0.01) direction = 'left';
        else direction = 'stationary';
      }
      setCurrentBarDirection(direction);
    } else {
      setCurrentBarDirection(null);
    }
  }, [gameState, stopwatchTime, targetGraphData]);

  return (
    <React.Fragment>
      <div className="flex flex-col items-center justify-start min-h-screen bg-slate-100 text-slate-800 p-2 sm:p-4 font-sans">
        <header className="w-full max-w-4xl mb-3 sm:mb-4 text-center relative">
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-700">Distance vs. Time Graph Explorer</h1>
          <p className="text-sm sm:text-base text-slate-600">Match the blue graph by moving your mouse along the 'Home-Destination' bar.</p>
          <div className="absolute top-0 right-0 h-full flex items-center">
            <div className="text-sm font-semibold text-amber-600 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg shadow-sm">
              Best Score: {bestScore}%
            </div>
          </div>
        </header>

        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-sky-600">How to Play</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-slate-700">
                <li>A <span className="text-blue-600 font-semibold">blue target graph</span> will appear.</li>
                <li>Press <span className="text-green-600 font-semibold">START</span>. A countdown begins.</li>
                <li>After "GO!", move your mouse cursor horizontally along the <span className="font-semibold">grey 'Home-Destination' bar</span>.</li>
                <li>Your movement plots a <span className="text-red-600 font-semibold">red line</span> in real-time.</li>
                <li>Try to match the blue line. The recording stops at "Destination" or after {TARGET_MAX_TIME}s.</li>
                <li>Review your attempt! Use the <span className="font-semibold">timeline slider</span>. Hover over blue segments for info.</li>
                <li>Press <span className="text-orange-500 font-semibold">RETRY</span> or <span className="text-purple-500 font-semibold">NEW GRAPH</span>.</li>
              </ol>
              <button onClick={toggleTutorial} className="mt-5 sm:mt-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full">
                Got it!
              </button>
            </div>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center z-40">
            <div className="text-8xl sm:text-9xl font-bold text-white animate-pingOnce" style={{animationDuration: '0.9s'}}>
              {countdownValue > 0 ? countdownValue : "GO!"}
            </div>
          </div>
        )}

        <main className="w-full max-w-4xl bg-white p-3 sm:p-6 rounded-lg shadow-xl">
          <div className="relative">
            <div className="flex justify-between items-center mb-1 min-h-[50px] sm:min-h-[60px]">
              <button onClick={toggleTutorial} className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-bold w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm border border-sky-200" title="How to Play">
                <HelpIcon />
              </button>
              <div className="flex-grow text-center">
                {gameState === 'analysis' && (
                    <div className={`text-center ${playSuccessAnimation ? 'score-animation' : ''}`}>
                    <p className="text-md sm:text-lg font-semibold">{feedbackMessage}</p>
                    <p className="text-xl sm:text-2xl font-bold text-sky-600">Similarity: {similarityScore}%</p>
                    </div>
                )}
              </div>
              <div className="w-9 h-9">{/* Placeholder to balance the layout */}</div>
            </div>
            
            <div className="relative">
              <svg ref={svgRef} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto border border-slate-300 rounded-md bg-gray-50"></svg>
              {gameState === 'recording' && <Stopwatch time={stopwatchTime} />}
            </div>

            {tooltip && gameState === 'analysis' && (
               <div className="fixed bg-slate-800 text-white text-xs p-2 rounded-md shadow-lg pointer-events-none z-50" style={{ left: tooltip.x + 15, top: tooltip.y + 15, maxWidth: '200px' }}>
                {tooltip.content}
              </div>
            )}
          </div>

          {gameState === 'analysis' && performanceMetrics && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                <h3 className="text-lg font-semibold text-center mb-3">Performance Breakdown</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-slate-500">Metric</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-600">Your Trace</p>
                    </div>
                     <div>
                        <p className="text-sm font-semibold text-blue-600">Target</p>
                    </div>
                    
                    <div className="font-medium text-slate-700">Max Distance</div>
                    <div>{performanceMetrics.user.maxDist} m</div>
                    <div>{performanceMetrics.target.maxDist} m</div>
                   
                    <div className="font-medium text-slate-700">End Time</div>
                    <div>{performanceMetrics.user.time} s</div>
                    <div>{performanceMetrics.target.time} s</div>

                </div>
            </div>
          )}

          {gameState === 'analysis' && targetGraphData && targetGraphData.length > 0 && (
            <div className="mt-4 px-1 sm:px-2">
              <label htmlFor="timelineSlider" className="block text-sm font-medium text-slate-700 mb-1">
                Interactive Timeline (Time: {timelineValue.toFixed(1)}s)
              </label>
              <input type="range" id="timelineSlider" min="0" max={TARGET_MAX_TIME} step="0.1" value={timelineValue} onChange={(e) => setTimelineValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          )}

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">Trace your path here:</p>
            <div ref={homeDestBarRef} onMouseMove={handleMouseMoveOnBar} className={`relative w-full bg-slate-300 transition-colors duration-150 rounded-lg flex items-center justify-between px-2 select-none overflow-hidden car-cursor`} style={{ height: `${HOME_DEST_BAR_HEIGHT}px`}}>
              <span className="text-sm sm:text-base font-bold text-slate-800">Home</span>
              {currentBarDirection && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center text-sky-600 pointer-events-none">
                      {currentBarDirection === 'left' && <ChevronLeftIcon />}
                      {currentBarDirection === 'right' && <ChevronRightIcon />}
                      {currentBarDirection === 'stationary' && <PauseIcon />}
                  </div>
              )}
              <span className="text-sm sm:text-base font-bold text-slate-800">Destination ({currentMaxDistance}m)</span>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button onClick={handleStart} disabled={gameState === 'recording' || gameState === 'countdown'} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-400 disabled:text-slate-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center text-sm sm:text-lg">
              <PlayIcon /> <span className="ml-1 sm:ml-2">START</span>
            </button>
            <button onClick={handleRetry} disabled={gameState === 'recording' || gameState === 'countdown' || !targetGraphData || targetGraphData.length === 0} className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 disabled:text-slate-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center text-sm sm:text-lg">
              <RetryIcon /> <span className="ml-1 sm:ml-2">RETRY</span>
            </button>
            <button onClick={handleNewGraph} disabled={gameState === 'recording' || gameState === 'countdown'} className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-400 disabled:text-slate-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center text-sm sm:text-lg">
              <NewGraphIcon /> <span className="ml-1 sm:ml-2">NEW GRAPH</span>
            </button>
          </div>
        </main>
        <footer className="mt-6 sm:mt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Distance vs. Time Graph Explorer. For educational fun!</p>
        </footer>
      </div>
    </React.Fragment>
  );
};

const Stopwatch = ({ time }) => (
  <div className="absolute top-0 right-2 mt-2 text-lg sm:text-xl font-mono text-rose-600 bg-white/80 px-2 py-0.5 rounded-md shadow backdrop-blur-sm z-10">
    {time.toFixed(2)}s
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
    </script>
</body>
</html>
