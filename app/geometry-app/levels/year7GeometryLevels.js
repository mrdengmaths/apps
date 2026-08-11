// levels/year7GeometryLevels.js
(function () {
    function makeQuestion(problem, answer, format, choices, diagram, problemType) {
        const q = { problem, answer, format: format || 'text' };
        if (choices) q.choices = choices;
        if (diagram) q.diagram = diagram;
        if (problemType) q.problemType = problemType;
        return q;
    }

    function createLevel(key, name, questions) {
        return {
            key,
            name,
            questions,
            usedQuestionIndices: new Set(),
            generateQuestion() {
                if (this.usedQuestionIndices.size >= this.questions.length) {
                    this.usedQuestionIndices.clear();
                }

                let questionIndex;
                do {
                    questionIndex = Math.floor(Math.random() * this.questions.length);
                } while (this.usedQuestionIndices.has(questionIndex));

                this.usedQuestionIndices.add(questionIndex);
                return this.questions[questionIndex];
            },
            getQuestions() {
                return this.questions;
            }
        };
    }

    const levels = {
        // 7A Points, lines, intervals and angles
        year7PointsLinesAnglesEasy: createLevel('year7PointsLinesAnglesEasy', '7A Points, Lines, Intervals & Angles (Easy)', [
            makeQuestion('How many end points does a line segment have?', '2', 'numeric'),
            makeQuestion('How many end points does a ray have?', '1', 'numeric'),
            makeQuestion('How many end points does a line have?', '0', 'numeric'),
            makeQuestion('In ∠ABC, which letter is the vertex?', 'B', 'mcq', ['B', 'A', 'C', 'A and C']),
            makeQuestion('An angle smaller than 90° is called?', 'acute angle', 'mcq', ['acute angle', 'obtuse angle', 'reflex angle', 'straight angle']),
            makeQuestion('An angle of 90° is called?', 'right angle', 'mcq', ['right angle', 'acute angle', 'obtuse angle', 'reflex angle']),
            makeQuestion('An angle between 90° and 180° is called?', 'obtuse angle', 'mcq', ['obtuse angle', 'acute angle', 'straight angle', 'reflex angle']),
            makeQuestion('An angle of 180° is called?', 'straight angle', 'mcq', ['straight angle', 'right angle', 'reflex angle', 'full angle']),
            makeQuestion('An angle between 180° and 360° is called?', 'reflex angle', 'mcq', ['reflex angle', 'obtuse angle', 'acute angle', 'straight angle']),
            makeQuestion('The notation AB usually describes what, if no arrows are shown?', 'line segment', 'mcq', ['line segment', 'line', 'ray', 'angle']),
            makeQuestion('A full turn is how many degrees?', '360', 'numeric')
        ]),
        year7PointsLinesAnglesMedium: createLevel('year7PointsLinesAnglesMedium', '7A Points, Lines, Intervals & Angles (Medium)', [
            makeQuestion('If one ray points east and another points north, what is the angle between them?', '90', 'numeric'),
            makeQuestion('Angle PQR = 128°. Classify it.', 'obtuse angle', 'mcq', ['obtuse angle', 'acute angle', 'reflex angle', 'straight angle']),
            makeQuestion('Angle ABC = 275°. Classify it.', 'reflex angle', 'mcq', ['reflex angle', 'acute angle', 'obtuse angle', 'straight angle']),
            makeQuestion('If m∠ABC = 64°, then m∠CBA is necessarily 64°.', 'no', 'mcq', ['no', 'yes', 'always', 'only if reflex']),
            makeQuestion('How many degrees in three right angles?', '270', 'numeric'),
            makeQuestion('A straight angle is equal to how many right angles?', '2', 'numeric'),
            makeQuestion('In ∠DEF, the vertex is?', 'E', 'mcq', ['E', 'D', 'F', 'D and F']),
            makeQuestion('The shorter distance between A and B is represented by which object?', 'line segment', 'mcq', ['line segment', 'line', 'ray', 'plane']),
            makeQuestion('An interval from 3 to 9 has length?', '6', 'numeric'),
            makeQuestion('Interval from -2 to 5 has length?', '7', 'numeric'),
            makeQuestion('A student says 179° is reflex. Is this correct?', 'no', 'mcq', ['no', 'yes', 'sometimes', 'cannot tell'])
        ]),
        year7PointsLinesAnglesHard: createLevel('year7PointsLinesAnglesHard', '7A Points, Lines, Intervals & Angles (Hard)', [
            makeQuestion('Starting from north, a turn clockwise to west is how many degrees?', '270', 'numeric'),
            makeQuestion('Starting from east, a turn anti-clockwise to south is how many degrees?', '270', 'numeric'),
            makeQuestion('In ∠XYZ, which point is the vertex?', 'Y', 'mcq', ['Y', 'X', 'Z', 'X and Z']),
            makeQuestion('Two rays make a reflex angle of 300°. What is the smaller angle?', '60', 'numeric'),
            makeQuestion('A point C is between A and B. If AB = 19 and AC = 7, then CB = ?', '12', 'numeric'),
            makeQuestion('If m∠ABC = 90°, classify ∠ABC.', 'right angle', 'mcq', ['right angle', 'acute angle', 'obtuse angle', 'straight angle']),
            makeQuestion('If m∠PQR = 180°, classify ∠PQR.', 'straight angle', 'mcq', ['straight angle', 'reflex angle', 'obtuse angle', 'acute angle']),
            makeQuestion('Which is always true for a line segment?', 'it has two end points', 'mcq', ['it has two end points', 'it extends forever in both directions', 'it has one end point', 'it has no end points']),
            makeQuestion('Which angle type can be exactly 180°?', 'straight angle', 'mcq', ['straight angle', 'obtuse angle', 'acute angle', 'reflex angle']),
            makeQuestion('A student labels 90° as acute. Choose the best correction.', '90° is right, not acute', 'mcq', ['90° is right, not acute', '90° is obtuse', '90° is reflex', '90° is straight']),
            makeQuestion('A student labels 180° as obtuse. Choose the best correction.', '180° is straight, not obtuse', 'mcq', ['180° is straight, not obtuse', '180° is reflex', '180° is acute', '180° is right']),
            makeQuestion('m∠LMN = 32° and m∠NMP = 32°. Are ∠LMN and ∠NMP equal in size?', 'yes', 'mcq', ['yes', 'no', 'cannot compare', 'only if reflex'])
        ]),

        // 7B Adjacent angles and vertically opposite angles
        year7AdjacentVerticallyOppositeEasy: createLevel('year7AdjacentVerticallyOppositeEasy', '7B Adjacent & Vertically Opposite Angles (Easy)', [
            makeQuestion('Two intersecting lines create how many angles?', '4', 'numeric'),
            makeQuestion('Vertically opposite angles are always?', 'equal', 'mcq', ['equal', 'different', 'acute only', 'random']),
            makeQuestion('Angles that share a vertex and one common arm are?', 'adjacent angles', 'mcq', ['adjacent angles', 'vertically opposite angles', 'reflex angles', 'parallel lines']),
            makeQuestion('If one angle at an intersection is 65°, its vertically opposite angle is?', '65', 'numeric'),
            makeQuestion('If two adjacent angles form a straight line, their sum is?', '180', 'numeric'),
            makeQuestion('If one angle is 110° on a line, its adjacent angle is?', '70', 'numeric'),
            makeQuestion('If one angle is 48° at an intersection, the adjacent angle is?', '132', 'numeric'),
            makeQuestion('Adjacent angles must share what?', 'a common arm', 'mcq', ['a common arm', 'equal size', 'a right angle', 'parallel lines']),
            makeQuestion('Vertically opposite angles share an arm.', 'false', 'mcq', ['false', 'true', 'sometimes', 'only if right angles']),
            makeQuestion('If one angle is x and the adjacent angle is 3x on a straight line, x = ?', '45', 'numeric')
        ]),
        year7AdjacentVerticallyOppositeMedium: createLevel('year7AdjacentVerticallyOppositeMedium', '7B Adjacent & Vertically Opposite Angles (Medium)', [
            makeQuestion('At an intersection one angle is 7x and its adjacent angle is 5x. Find x.', '15', 'numeric'),
            makeQuestion('At an intersection one angle is 4x+10 and its vertically opposite angle is 6x-30. Find x.', '20', 'numeric'),
            makeQuestion('If one angle is 125°, all acute angles at that intersection are?', '55', 'numeric'),
            makeQuestion('Angles A and B are adjacent on a straight line. If A=2x+15 and B=3x-5, find x.', '34', 'numeric'),
            makeQuestion('Angles p and q are vertically opposite. If p=9y-4 and q=5y+28, find y.', '8', 'numeric'),
            makeQuestion('A student says adjacent angles are always equal. Choose best response.', 'false they only need a shared arm and vertex', 'mcq', ['false they only need a shared arm and vertex', 'true they are always equal', 'true but only on parallel lines', 'cannot tell']),
            makeQuestion('One angle is 92°. Its vertically opposite angle is?', '92', 'numeric'),
            makeQuestion('One angle is 92°. Its adjacent angle is?', '88', 'numeric'),
            makeQuestion('Which pair is guaranteed equal?', 'vertically opposite angles', 'mcq', ['vertically opposite angles', 'adjacent angles', 'angles on a straight line', 'random adjacent pair']),
            makeQuestion('A student confuses adjacent and vertically opposite. Adjacent means?', 'share a common arm', 'mcq', ['share a common arm', 'are opposite each other', 'sum to 360', 'must be equal'])
        ]),
        year7AdjacentVerticallyOppositeHard: createLevel('year7AdjacentVerticallyOppositeHard', '7B Adjacent & Vertically Opposite Angles (Hard)', [
            makeQuestion('Around a point, two lines intersect. If one angle is 3x-8 and adjacent is x+28, find x.', '40', 'numeric'),
            makeQuestion('At an intersection, one angle is 5x+10 and the adjacent angle is 3x+30. Find x.', '17.5', 'numeric'),
            makeQuestion('At an intersection, one angle is 2a+35 and vertically opposite is 5a-25. Find a.', '20', 'numeric'),
            makeQuestion('If one angle is 157°, find the difference between it and its adjacent angle.', '134', 'numeric'),
            makeQuestion('If one angle is k and each adjacent angle is 2k, find k.', '60', 'numeric'),
            makeQuestion('Choose the correct statement.', 'adjacent angles can be equal but are not always equal', 'mcq', ['adjacent angles can be equal but are not always equal', 'adjacent angles are always equal', 'vertically opposite angles are never equal', 'angles on a straight line are always equal']),
            makeQuestion('One angle is 44°. The angle vertically opposite is 44° and each adjacent is?', '136', 'numeric'),
            makeQuestion('If adjacent angles are in ratio 2:7 on a straight line, the smaller is?', '40', 'numeric'),
            makeQuestion('If vertically opposite angles are x+18 and 3x-42, find x.', '30', 'numeric'),
            makeQuestion('A student says 110° and 70° are vertically opposite. Best correction?', 'they are adjacent angles on a straight line', 'mcq', ['they are adjacent angles on a straight line', 'they are vertically opposite', 'they are equal', 'they are both acute'])
        ]),

        // 7C Transversal lines and parallel lines
        year7TransversalParallelEasy: createLevel('year7TransversalParallelEasy', '7C Transversal & Parallel Lines (Easy)', [
            makeQuestion('If two parallel lines are cut by a transversal, corresponding angles are?', 'equal', 'mcq', ['equal', 'different', 'always 90', 'random']),
            makeQuestion('For parallel lines, alternate interior angles are?', 'equal', 'mcq', ['equal', 'different', 'always 90', 'always reflex']),
            makeQuestion('For parallel lines, co-interior angles sum to?', '180', 'numeric'),
            makeQuestion('Corresponding angles: if one is 73°, the matching one is?', '73', 'numeric'),
            makeQuestion('Alternate interior angles: if one is 121°, the matching one is?', '121', 'numeric'),
            makeQuestion('Co-interior with 126° gives the other as?', '54', 'numeric'),
            makeQuestion('A line crossing two lines is called?', 'transversal', 'mcq', ['transversal', 'segment', 'median', 'bisector']),
            makeQuestion('If corresponding angles are equal, the two lines are?', 'parallel', 'mcq', ['parallel', 'perpendicular', 'intersecting', 'coincident']),
            makeQuestion('A student says co-interior are equal. Correct?', 'no', 'mcq', ['no', 'yes', 'only for right angles', 'only for acute angles']),
            makeQuestion('Co-interior pair 95° and x°. Find x.', '85', 'numeric')
        ]),
        year7TransversalParallelMedium: createLevel('year7TransversalParallelMedium', '7C Transversal & Parallel Lines (Medium)', [
            makeQuestion('In parallel lines with transversal, if one corresponding angle is 2x+15 and another is 5x-30, find x.', '15', 'numeric'),
            makeQuestion('Alternate interior angles are 3y+7 and y+41. Find y.', '17', 'numeric'),
            makeQuestion('Co-interior angles are 4a+12 and 2a+18. Find a.', '25', 'numeric'),
            makeQuestion('If one acute angle made by a transversal is 38°, the obtuse partner is?', '142', 'numeric'),
            makeQuestion('A student uses corresponding instead of alternate interior. Are both valid in parallel lines?', 'yes if the indicated pair matches the rule', 'mcq', ['yes if the indicated pair matches the rule', 'no only corresponding works', 'no only alternate works', 'never']),
            makeQuestion('Co-interior angles are x and 3x. Find x.', '45', 'numeric'),
            makeQuestion('One corresponding angle is 109°. The matching angle is?', '109', 'numeric'),
            makeQuestion('One interior angle is 109°. The interior angle on same side of transversal is?', '71', 'numeric'),
            makeQuestion('Which test can prove lines are parallel?', 'equal alternate interior angles', 'mcq', ['equal alternate interior angles', 'one obtuse one acute', 'angles add to 90', 'all lines have a transversal']),
            makeQuestion('A student says 120° and 60° are corresponding. Best correction?', 'they are co-interior supplementary', 'mcq', ['they are co-interior supplementary', 'they are corresponding equal', 'they are vertically opposite', 'they are adjacent only'])
        ]),
        year7TransversalParallelHard: createLevel('year7TransversalParallelHard', '7C Transversal & Parallel Lines (Hard)', [
            makeQuestion('With parallel lines, corresponding angles are 5x-7 and 3x+21. Find x.', '14', 'numeric'),
            makeQuestion('Co-interior angles are 7x+5 and 3x+15. Find x.', '16', 'numeric'),
            makeQuestion('An alternate interior angle is 4n-2 and its match is 2n+26. Find n.', '14', 'numeric'),
            makeQuestion('If one acute angle is t and one obtuse angle is 5t, find t.', '30', 'numeric'),
            makeQuestion('In a parallel-line diagram, an angle is 2x+8 and its co-interior partner is 4x-20. Find x.', '32', 'numeric'),
            makeQuestion('Select the always true statement.', 'co-interior angles on parallel lines sum to 180°', 'mcq', ['co-interior angles on parallel lines sum to 180°', 'co-interior angles are equal', 'corresponding angles sum to 180°', 'alternate angles are supplementary']),
            makeQuestion('One corresponding angle is 32°. A co-interior with it is?', '148', 'numeric'),
            makeQuestion('One angle is 148°. The acute angle made by the transversal is?', '32', 'numeric'),
            makeQuestion('Student claim: equal corresponding angles do not imply parallel lines. Correct?', 'incorrect the converse proves lines are parallel', 'mcq', ['incorrect the converse proves lines are parallel', 'correct there is no converse', 'correct only alternate works', 'cannot conclude']),
            makeQuestion('Angles x and x+40 are co-interior. Find x.', '70', 'numeric')
        ]),

        // 7D Solving geometry problems with parallel lines
        year7ParallelProblemsEasy: createLevel('year7ParallelProblemsEasy', '7D Parallel-Line Geometry Problems (Easy)', [
            makeQuestion('In a parallel-line diagram one angle is 64°. Find a corresponding angle.', '64', 'numeric'),
            makeQuestion('In a parallel-line diagram one angle is 64°. Find the co-interior angle with it.', '116', 'numeric'),
            makeQuestion('Given parallel lines, one interior angle is 133°. Adjacent interior on same side is?', '47', 'numeric'),
            makeQuestion('If angle a corresponds to 82°, angle a is?', '82', 'numeric'),
            makeQuestion('If angle b is co-interior with 82°, angle b is?', '98', 'numeric'),
            makeQuestion('Which rule is used when two angles add to 180° on parallel lines?', 'co-interior angles', 'mcq', ['co-interior angles', 'corresponding angles', 'alternate interior', 'vertically opposite']),
            makeQuestion('One angle is 101° in a parallel set. Its corresponding angle is?', '101', 'numeric'),
            makeQuestion('One angle is 101° in a parallel set. Acute companion is?', '79', 'numeric'),
            makeQuestion('If one angle is 55°, how many distinct angle sizes exist in the standard diagram?', '2', 'numeric'),
            makeQuestion('Those two distinct angle sizes must sum to?', '180', 'numeric')
        ]),
        year7ParallelProblemsMedium: createLevel('year7ParallelProblemsMedium', '7D Parallel-Line Geometry Problems (Medium)', [
            makeQuestion('Angles 3x+11 and 5x-9 are corresponding. Find x.', '10', 'numeric'),
            makeQuestion('Angles 2y+15 and y+75 are alternate interior. Find y.', '60', 'numeric'),
            makeQuestion('Co-interior angles are 4a+6 and 2a+24. Find a.', '25', 'numeric'),
            makeQuestion('In a chain of reasoning, first use corresponding then straight-line. Which is valid?', 'valid if each pair is correctly identified', 'mcq', ['valid if each pair is correctly identified', 'invalid you can use only one rule', 'invalid because straight-line is never used', 'always invalid']),
            makeQuestion('One angle is 7x-1 and co-interior with 3x+21. Find x.', '16', 'numeric'),
            makeQuestion('One corresponding angle is 122°. Find the adjacent angle on same intersection.', '58', 'numeric'),
            makeQuestion('If an angle is x and all corresponding to it are also x, what must x be if co-interior partner is 140°?', '40', 'numeric'),
            makeQuestion('Student confusion: says alternate interior are supplementary. Best correction?', 'they are equal when lines are parallel', 'mcq', ['they are equal when lines are parallel', 'they are supplementary', 'they are only acute', 'they are vertically opposite']),
            makeQuestion('Angles p and q are co-interior with p=2q and p+q=180. Find p.', '120', 'numeric'),
            makeQuestion('Angles m and n are corresponding with m=4n-36 and n=24. Find m.', '60', 'numeric')
        ]),
        year7ParallelProblemsHard: createLevel('year7ParallelProblemsHard', '7D Parallel-Line Geometry Problems (Hard)', [
            makeQuestion('In a parallel-line problem, angle A=5x+10 and co-interior angle B=3x+26. Find x.', '18', 'numeric'),
            makeQuestion('Angles 2x+14 and 6x-42 are corresponding. Find x.', '14', 'numeric'),
            makeQuestion('An exterior angle is 7y-3 and equal to an alternate interior angle 4y+36. Find y.', '13', 'numeric'),
            makeQuestion('If one acute angle is k and each obtuse angle is 3k, find k.', '45', 'numeric'),
            makeQuestion('Three-step chain gives x + 2x + 30 = 180 from parallel relations. Solve x.', '50', 'numeric'),
            makeQuestion('Best justification for proving lines parallel from angle data?', 'use converse angle rules such as equal corresponding angles', 'mcq', ['use converse angle rules such as equal corresponding angles', 'assume they are parallel by drawing', 'measure with ruler only', 'use triangle sum only']),
            makeQuestion('If corresponding angles are 11a-13 and 7a+35, find a.', '12', 'numeric'),
            makeQuestion('Co-interior are 9b-2 and 5b+18. Find b.', '20.5', 'numeric'),
            makeQuestion('A student gets x=130 for an acute angle in parallel-line setup. Likely issue?', 'mixed up supplementary and equal pairs', 'mcq', ['mixed up supplementary and equal pairs', 'always correct acute can be 130', 'used vertically opposite only', 'no issue']),
            makeQuestion('If an angle is 33°, every obtuse angle formed by same transversal is?', '147', 'numeric')
        ]),

        // 7E Classifying and constructing triangles
        year7TrianglesEasy: createLevel('year7TrianglesEasy', '7E Classify & Construct Triangles (Easy)', [
            makeQuestion('A triangle with all sides equal is?', 'equilateral', 'mcq', ['equilateral', 'isosceles', 'scalene', 'right']),
            makeQuestion('A triangle with exactly two equal sides is?', 'isosceles', 'mcq', ['isosceles', 'equilateral', 'scalene', 'right']),
            makeQuestion('A triangle with all sides different is?', 'scalene', 'mcq', ['scalene', 'isosceles', 'equilateral', 'right']),
            makeQuestion('A triangle with one 90° angle is?', 'right-angled', 'mcq', ['right-angled', 'obtuse', 'acute', 'equilateral']),
            makeQuestion('Can a triangle have two right angles?', 'no', 'mcq', ['no', 'yes', 'sometimes', 'only isosceles']),
            makeQuestion('If sides are 5, 5, 8 classify by side lengths.', 'isosceles', 'mcq', ['isosceles', 'equilateral', 'scalene', 'right-angled']),
            makeQuestion('If sides are 6, 7, 8 classify by side lengths.', 'scalene', 'mcq', ['scalene', 'isosceles', 'equilateral', 'right-angled']),
            makeQuestion('How many sides does a triangle have?', '3', 'numeric'),
            makeQuestion('How many interior angles in a triangle?', '3', 'numeric'),
            makeQuestion('An equilateral triangle has each angle?', '60', 'numeric')
        ]),
        year7TrianglesMedium: createLevel('year7TrianglesMedium', '7E Classify & Construct Triangles (Medium)', [
            makeQuestion('Angles 40°, 70°, 70°. Classify by angle and side.', 'acute isosceles', 'mcq', ['acute isosceles', 'right isosceles', 'obtuse scalene', 'equilateral']),
            makeQuestion('Angles 90°, 35°, 55°. Classify by angle.', 'right-angled', 'mcq', ['right-angled', 'acute', 'obtuse', 'equilateral']),
            makeQuestion('Sides 9, 9, 9. Classify.', 'equilateral', 'mcq', ['equilateral', 'isosceles', 'scalene', 'right-angled']),
            makeQuestion('Sides 4, 4, 7 and largest angle type?', 'obtuse', 'mcq', ['obtuse', 'acute', 'right', 'straight']),
            makeQuestion('If a triangle has two equal angles, what must be true?', 'it is isosceles', 'mcq', ['it is isosceles', 'it is equilateral', 'it is scalene', 'it is right-angled']),
            makeQuestion('A student says equilateral is not isosceles. Best correction?', 'equilateral is a special isosceles with all sides equal', 'mcq', ['equilateral is a special isosceles with all sides equal', 'equilateral is scalene', 'equilateral has two equal sides only', 'equilateral is right-angled']),
            makeQuestion('Triangle has angles 50°, 50°, x°. Find x.', '80', 'numeric'),
            makeQuestion('Triangle has sides 7, 7, x with perimeter 24. Find x.', '10', 'numeric'),
            makeQuestion('Can side lengths 2, 3, 6 form a triangle?', 'no', 'mcq', ['no', 'yes', 'only right triangle', 'only isosceles']),
            makeQuestion('How many equal sides in a scalene triangle?', '0', 'numeric')
        ]),
        year7TrianglesHard: createLevel('year7TrianglesHard', '7E Classify & Construct Triangles (Hard)', [
            makeQuestion('Triangle has angles x, x+20, x+40. Find x.', '40', 'numeric'),
            makeQuestion('Isosceles triangle has vertex angle 36°. Each base angle is?', '72', 'numeric'),
            makeQuestion('Right triangle has one acute angle 28°. Other acute angle?', '62', 'numeric'),
            makeQuestion('Triangle sides 10, 10, 12. Angle type opposite side 12 is?', 'obtuse', 'mcq', ['obtuse', 'acute', 'right', 'straight']),
            makeQuestion('Student says all isosceles triangles are equilateral. Best correction?', 'false only some isosceles are equilateral', 'mcq', ['false only some isosceles are equilateral', 'true always', 'true if one angle is right', 'cannot classify']),
            makeQuestion('Angles are 2a, 3a, 4a. Find a.', '20', 'numeric'),
            makeQuestion('Perimeter 30, isosceles sides 11 and 11. Base length?', '8', 'numeric'),
            makeQuestion('Can 8, 8, 16 form a triangle?', 'no', 'mcq', ['no', 'yes', 'yes right triangle', 'yes obtuse triangle']),
            makeQuestion('Triangle angles 89°, 46°, x°. Find x.', '45', 'numeric'),
            makeQuestion('A triangle has one angle > 90°. It must be?', 'obtuse triangle', 'mcq', ['obtuse triangle', 'acute triangle', 'right triangle', 'equilateral'])
        ]),

        // 7F Classifying quadrilaterals and polygons
        year7QuadrilateralsPolygonsEasy: createLevel('year7QuadrilateralsPolygonsEasy', '7F Classify Quadrilaterals & Polygons (Easy)', [
            makeQuestion('A polygon with 3 sides is a?', 'triangle', 'mcq', ['triangle', 'quadrilateral', 'pentagon', 'hexagon']),
            makeQuestion('A polygon with 4 sides is a?', 'quadrilateral', 'mcq', ['quadrilateral', 'pentagon', 'hexagon', 'heptagon']),
            makeQuestion('A polygon with 5 sides is a?', 'pentagon', 'mcq', ['pentagon', 'hexagon', 'quadrilateral', 'octagon']),
            makeQuestion('A polygon with 6 sides is a?', 'hexagon', 'mcq', ['hexagon', 'pentagon', 'septagon', 'octagon']),
            makeQuestion('A quadrilateral with one pair of parallel sides is called?', 'trapezium', 'mcq', ['trapezium', 'parallelogram', 'kite', 'rectangle']),
            makeQuestion('A quadrilateral with two pairs of parallel sides is?', 'parallelogram', 'mcq', ['parallelogram', 'kite', 'trapezium', 'polygon']),
            makeQuestion('A rectangle always has how many right angles?', '4', 'numeric'),
            makeQuestion('A square has all sides?', 'equal', 'mcq', ['equal', 'different', 'parallel only', 'none']),
            makeQuestion('A rhombus has all sides?', 'equal', 'mcq', ['equal', 'right angles only', 'no parallel sides', 'one pair equal']),
            makeQuestion('A kite has how many pairs of adjacent equal sides?', '2', 'numeric')
        ]),
        year7QuadrilateralsPolygonsMedium: createLevel('year7QuadrilateralsPolygonsMedium', '7F Classify Quadrilaterals & Polygons (Medium)', [
            makeQuestion('Which shape always has opposite sides parallel and equal?', 'parallelogram', 'mcq', ['parallelogram', 'kite', 'trapezium', 'pentagon']),
            makeQuestion('Which shape has all sides equal and all angles 90°?', 'square', 'mcq', ['square', 'rhombus', 'rectangle', 'kite']),
            makeQuestion('A student says every rhombus is a square. Correct?', 'no', 'mcq', ['no', 'yes', 'sometimes always', 'cannot tell']),
            makeQuestion('A regular pentagon has each exterior angle?', '72', 'numeric'),
            makeQuestion('Number of diagonals in a quadrilateral?', '2', 'numeric'),
            makeQuestion('Number of diagonals in a pentagon?', '5', 'numeric'),
            makeQuestion('An octagon has how many sides?', '8', 'numeric'),
            makeQuestion('A shape has one pair of opposite sides parallel and equal lengths not both pairs. Best name?', 'trapezium', 'mcq', ['trapezium', 'parallelogram', 'rhombus', 'square']),
            makeQuestion('Sum of interior angles of a pentagon is?', '540', 'numeric'),
            makeQuestion('Student confusion: rectangle vs parallelogram. Best statement?', 'every rectangle is a parallelogram', 'mcq', ['every rectangle is a parallelogram', 'every parallelogram is a rectangle', 'neither is related', 'only squares are parallelograms'])
        ]),
        year7QuadrilateralsPolygonsHard: createLevel('year7QuadrilateralsPolygonsHard', '7F Classify Quadrilaterals & Polygons (Hard)', [
            makeQuestion('Interior angle sum of a 9-sided polygon?', '1260', 'numeric'),
            makeQuestion('How many diagonals in a hexagon?', '9', 'numeric'),
            makeQuestion('How many diagonals in an octagon?', '20', 'numeric'),
            makeQuestion('Regular polygon has interior angle 135°. Number of sides?', '8', 'numeric'),
            makeQuestion('Regular polygon has exterior angle 30°. Number of sides?', '12', 'numeric'),
            makeQuestion('Choose always true statement.', 'all squares are rectangles and rhombuses', 'mcq', ['all squares are rectangles and rhombuses', 'all rhombuses are squares', 'all kites are parallelograms', 'all trapeziums are rectangles']),
            makeQuestion('A quadrilateral has 4 equal sides and no right-angle information. Most specific guaranteed type?', 'rhombus', 'mcq', ['rhombus', 'square', 'rectangle', 'kite']),
            makeQuestion('A quadrilateral has one pair of opposite angles equal and one pair of opposite sides parallel. Most likely?', 'parallelogram', 'mcq', ['parallelogram', 'kite', 'trapezium', 'pentagon']),
            makeQuestion('A student says a kite must have opposite equal sides. Best correction?', 'kite has adjacent equal side pairs', 'mcq', ['kite has adjacent equal side pairs', 'kite has opposite equal sides only', 'kite has all equal sides', 'kite has no equal sides']),
            makeQuestion('Interior angle sum of an n-gon is 1800°. Find n.', '12', 'numeric')
        ]),

        // 7G Angle sum of a triangle
        year7TriangleAngleSumEasy: createLevel('year7TriangleAngleSumEasy', '7G Angle Sum of a Triangle (Easy)', [
            makeQuestion('The interior angles of a triangle always sum to?', '180', 'numeric'),
            makeQuestion('Triangle has angles 50° and 60°. Third angle?', '70', 'numeric'),
            makeQuestion('Triangle has angles 90° and 35°. Third angle?', '55', 'numeric'),
            makeQuestion('Triangle has angles 40° and 40°. Third angle?', '100', 'numeric'),
            makeQuestion('If one angle is 120°, the triangle is?', 'obtuse', 'mcq', ['obtuse', 'acute', 'right', 'equilateral']),
            makeQuestion('Equilateral triangle each angle is?', '60', 'numeric'),
            makeQuestion('Isosceles triangle base angles are?', 'equal', 'mcq', ['equal', 'supplementary', 'always 90', 'always obtuse']),
            makeQuestion('Triangle angles 75°, 75°, x°. Find x.', '30', 'numeric'),
            makeQuestion('Can triangle angles be 70°, 60°, 40°?', 'yes', 'mcq', ['yes', 'no', 'only right triangle', 'only isosceles']),
            makeQuestion('Can triangle angles be 100°, 50°, 40°?', 'no', 'mcq', ['no', 'yes', 'only obtuse triangle', 'cannot tell'])
        ]),
        year7TriangleAngleSumMedium: createLevel('year7TriangleAngleSumMedium', '7G Angle Sum of a Triangle (Medium)', [
            makeQuestion('Angles are x, x, 40°. Find x.', '70', 'numeric'),
            makeQuestion('Angles are 2x, x+10, x+20. Find x.', '30', 'numeric'),
            makeQuestion('Right triangle has one acute angle 3x and the other x. Find x.', '22.5', 'numeric'),
            makeQuestion('Exterior angle at a vertex is 130°. Sum of two remote interior angles is?', '130', 'numeric'),
            makeQuestion('A student says triangle angles can sum to 360°. Correct?', 'no', 'mcq', ['no', 'yes', 'only equilateral', 'only obtuse']),
            makeQuestion('If two triangle angles are 48° and 67°, the third is?', '65', 'numeric'),
            makeQuestion('Isosceles triangle has equal angles 5y and 5y, third angle 40°. Find y.', '14', 'numeric'),
            makeQuestion('Angles are 3a-5, 2a+15, a+20. Find a.', '30', 'numeric'),
            makeQuestion('Which is impossible for triangle angles?', '95 50 40', 'mcq', ['95 50 40', '90 45 45', '60 60 60', '80 70 30']),
            makeQuestion('A student confuses exterior and interior angle sum. Best correction?', 'interior sum is 180° for any triangle', 'mcq', ['interior sum is 180° for any triangle', 'interior sum is 360°', 'interior sum changes with side lengths', 'only right triangles sum 180°'])
        ]),
        year7TriangleAngleSumHard: createLevel('year7TriangleAngleSumHard', '7G Angle Sum of a Triangle (Hard)', [
            makeQuestion('Angles are x+10, 2x-5, 3x-15. Find x.', '38', 'numeric'),
            makeQuestion('Isosceles triangle has vertex angle 2x and base angle x+15. Find x.', '50', 'numeric'),
            makeQuestion('Triangle angles are 4k, 5k, 9k. Find the largest angle.', '90', 'numeric'),
            makeQuestion('Exterior angle is 145° and one remote interior is 62°. Other remote interior?', '83', 'numeric'),
            makeQuestion('In a triangle, one angle is twice another, and third angle is 36°. Smallest angle?', '48', 'numeric'),
            makeQuestion('Choose the valid statement.', 'an exterior angle equals the sum of two remote interior angles', 'mcq', ['an exterior angle equals the sum of two remote interior angles', 'an exterior angle equals one adjacent interior angle', 'an exterior angle is always 90°', 'interior angles always equal each other']),
            makeQuestion('Triangle has angles a, a+20, a+40. Find a.', '40', 'numeric'),
            makeQuestion('A right triangle has acute angles in ratio 2:7. Larger acute angle?', '70', 'numeric'),
            makeQuestion('Student says 89°, 46°, 46° is possible. Correct?', 'no', 'mcq', ['no', 'yes', 'only isosceles', 'cannot determine']),
            makeQuestion('Angles are 3x+5, 2x+15, x+40. Find x.', '20', 'numeric')
        ]),

        // 7H Symmetry
        year7SymmetryEasy: createLevel('year7SymmetryEasy', '7H Symmetry (Easy)', [
            makeQuestion('A shape that looks the same after a flip has?', 'line symmetry', 'mcq', ['line symmetry', 'translation', 'dilation', 'shear']),
            makeQuestion('A square has how many lines of symmetry?', '4', 'numeric'),
            makeQuestion('A rectangle (not square) has how many lines of symmetry?', '2', 'numeric'),
            makeQuestion('An equilateral triangle has how many lines of symmetry?', '3', 'numeric'),
            makeQuestion('A scalene triangle has how many lines of symmetry?', '0', 'numeric'),
            makeQuestion('Order of rotational symmetry of a rectangle (not square)?', '2', 'numeric'),
            makeQuestion('Order of rotational symmetry of an equilateral triangle?', '3', 'numeric'),
            makeQuestion('Order of rotational symmetry of a regular pentagon?', '5', 'numeric'),
            makeQuestion('A circle has rotational symmetry of order?', 'infinite', 'mcq', ['infinite', '1', '2', '4']),
            makeQuestion('A student says a line of symmetry can be outside the shape. Correct for school geometry?', 'no', 'mcq', ['no', 'yes', 'sometimes only circles', 'always'])
        ]),
        year7SymmetryMedium: createLevel('year7SymmetryMedium', '7H Symmetry (Medium)', [
            makeQuestion('Regular hexagon: number of lines of symmetry?', '6', 'numeric'),
            makeQuestion('Regular hexagon: rotational symmetry order?', '6', 'numeric'),
            makeQuestion('Is a kite always line-symmetric?', 'sometimes', 'mcq', ['sometimes', 'always', 'never', 'only if square']),
            makeQuestion('A rhombus (not square) has how many lines of symmetry?', '2', 'numeric'),
            makeQuestion('A parallelogram (not rectangle/rhombus) has line symmetry count?', '0', 'numeric'),
            makeQuestion('Order of rotational symmetry of a parallelogram?', '2', 'numeric'),
            makeQuestion('A student says all quadrilaterals have rotational symmetry order 2. Correct?', 'no', 'mcq', ['no', 'yes', 'only if rectangle', 'only if kite']),
            makeQuestion('Regular n-gon has rotational symmetry order?', 'n', 'text'),
            makeQuestion('An isosceles triangle has how many lines of symmetry?', '1', 'numeric'),
            makeQuestion('Which has no line symmetry?', 'scalene triangle', 'mcq', ['scalene triangle', 'square', 'isosceles triangle', 'circle'])
        ]),
        year7SymmetryHard: createLevel('year7SymmetryHard', '7H Symmetry (Hard)', [
            makeQuestion('A regular polygon has each exterior angle 40°. Its lines of symmetry?', '9', 'numeric'),
            makeQuestion('A regular polygon has rotational symmetry order 12. Number of sides?', '12', 'numeric'),
            makeQuestion('A shape has one line symmetry and rotational order 1. A likely example?', 'isosceles triangle', 'mcq', ['isosceles triangle', 'square', 'rectangle', 'regular hexagon']),
            makeQuestion('If a shape has rotational symmetry order 4, smallest rotation angle is?', '90', 'numeric'),
            makeQuestion('A student says line symmetry count always equals rotational order. Correct?', 'no', 'mcq', ['no', 'yes', 'only for triangles', 'only for circles']),
            makeQuestion('Regular octagon rotational order?', '8', 'numeric'),
            makeQuestion('Regular octagon lines of symmetry?', '8', 'numeric'),
            makeQuestion('Non-square rectangle has rotational symmetry angle?', '180', 'numeric'),
            makeQuestion('Which statement is always true?', 'all regular polygons have equal line and rotational symmetry counts', 'mcq', ['all regular polygons have equal line and rotational symmetry counts', 'all polygons are line symmetric', 'all quadrilaterals have 4 lines symmetry', 'rotational order is always 2']),
            makeQuestion('A shape maps onto itself after 72° rotation. Maximum possible rotational order in one full turn?', '5', 'numeric')
        ]),

        // 7I Reflection and rotation
        year7ReflectionRotationEasy: createLevel('year7ReflectionRotationEasy', '7I Reflection & Rotation (Easy)', [
            makeQuestion('Reflecting over the y-axis changes x-coordinate to?', 'its opposite', 'mcq', ['its opposite', 'same value', 'double value', 'zero']),
            makeQuestion('Reflecting over the x-axis changes y-coordinate to?', 'its opposite', 'mcq', ['its opposite', 'same value', 'double value', 'zero']),
            makeQuestion('Point (3, -2) reflected in y-axis becomes?', '(-3, -2)', 'text'),
            makeQuestion('Point (3, -2) reflected in x-axis becomes?', '(3, 2)', 'text'),
            makeQuestion('Point (4, 1) rotated 90° anticlockwise about origin becomes?', '(-1, 4)', 'text'),
            makeQuestion('Point (4, 1) rotated 180° about origin becomes?', '(-4, -1)', 'text'),
            makeQuestion('A full rotation is?', '360', 'numeric'),
            makeQuestion('A half turn is?', '180', 'numeric'),
            makeQuestion('A quarter turn is?', '90', 'numeric'),
            makeQuestion('Student says reflection preserves size and shape. Correct?', 'yes', 'mcq', ['yes', 'no', 'only for triangles', 'only for circles'])
        ]),
        year7ReflectionRotationMedium: createLevel('year7ReflectionRotationMedium', '7I Reflection & Rotation (Medium)', [
            makeQuestion('Point (-5, 2) reflected in y-axis becomes?', '(5, 2)', 'text'),
            makeQuestion('Point (-5, 2) reflected in x-axis becomes?', '(-5, -2)', 'text'),
            makeQuestion('Point (2, 7) rotated 90° clockwise about origin?', '(7, -2)', 'text'),
            makeQuestion('Point (2, 7) rotated 270° anticlockwise about origin?', '(7, -2)', 'text'),
            makeQuestion('Reflect (6,-3) in line y=x gives?', '(-3, 6)', 'text'),
            makeQuestion('A student swaps signs instead of coordinates for y=x reflection. Correct?', 'no', 'mcq', ['no', 'yes', 'sometimes', 'only first quadrant']),
            makeQuestion('Point (-4,-9) rotated 180° about origin?', '(4, 9)', 'text'),
            makeQuestion('Point (0,5) reflected in x-axis?', '(0, -5)', 'text'),
            makeQuestion('Rotation preserves orientation?', 'yes', 'mcq', ['yes', 'no', 'only 180 degrees', 'only 90 degrees']),
            makeQuestion('Reflection preserves orientation?', 'no', 'mcq', ['no', 'yes', 'only y-axis', 'only x-axis'])
        ]),
        year7ReflectionRotationHard: createLevel('year7ReflectionRotationHard', '7I Reflection & Rotation (Hard)', [
            makeQuestion('Apply reflection in y-axis then x-axis to (3, -8). Final point?', '(-3, 8)', 'text'),
            makeQuestion('Apply rotation 90° anticlockwise then reflection in x-axis to (2,5). Final point?', '(-5, -2)', 'text'),
            makeQuestion('A point maps from (x,y) to (-x,-y). Which single transformation about origin?', 'rotation 180°', 'mcq', ['rotation 180°', 'reflection in x-axis', 'reflection in y-axis', 'translation']),
            makeQuestion('Point (7,-1) rotated 270° clockwise about origin?', '(-1, -7)', 'text'),
            makeQuestion('Reflect in x-axis then y-axis equals what single transformation?', 'rotation 180° about origin', 'mcq', ['rotation 180° about origin', 'reflection in y=x', 'translation', 'dilation']),
            makeQuestion('Point (-6,4) reflected in y=x then rotated 180°. Final point?', '(-4, 6)', 'text'),
            makeQuestion('Which pair are equivalent?', '90° clockwise equals 270° anticlockwise', 'mcq', ['90° clockwise equals 270° anticlockwise', '90° clockwise equals 90° anticlockwise', 'reflection equals rotation', '180° equals 90°']),
            makeQuestion('Point (a,b) reflected in y-axis then y-axis again becomes?', '(a, b)', 'text'),
            makeQuestion('A student says two reflections over perpendicular axes is identity. Correct?', 'no', 'mcq', ['no', 'yes', 'only for origin', 'cannot tell']),
            makeQuestion('Two reflections in x-axis then y-axis give net rotation of?', '180', 'numeric')
        ]),

        // 7J Translation
        year7TranslationEasy: createLevel('year7TranslationEasy', '7J Translation (Easy)', [
            makeQuestion('Translate point (2,3) by vector (4,1). New point?', '(6, 4)', 'text'),
            makeQuestion('Translate point (2,3) by vector (-5,2). New point?', '(-3, 5)', 'text'),
            makeQuestion('Translation moves a shape without?', 'rotating or resizing', 'mcq', ['rotating or resizing', 'changing direction only', 'changing area always', 'changing angle sizes']),
            makeQuestion('Point (-1,4) translated by (3,-6) gives?', '(2, -2)', 'text'),
            makeQuestion('Vector from (1,2) to (6,5) is?', '(5, 3)', 'text'),
            makeQuestion('Vector from (4,-1) to (0,7) is?', '(-4, 8)', 'text'),
            makeQuestion('A translation preserves shape and size.', 'true', 'mcq', ['true', 'false', 'only for triangles', 'only for squares']),
            makeQuestion('Translate (0,0) by (-7,9).', '(-7, 9)', 'text'),
            makeQuestion('If x increases by 3 and y decreases by 2, vector is?', '(3, -2)', 'text'),
            makeQuestion('Translate (5,-4) by (-2,-3).', '(3, -7)', 'text')
        ]),
        year7TranslationMedium: createLevel('year7TranslationMedium', '7J Translation (Medium)', [
            makeQuestion('Point A(3, -2) maps to A\'(10, 5). Translation vector?', '(7, 7)', 'text'),
            makeQuestion('Point B(-4, 6) maps to B\'(1, -3). Translation vector?', '(5, -9)', 'text'),
            makeQuestion('Apply translation (2,-3) twice to (1,1). Final point?', '(5, -5)', 'text'),
            makeQuestion('Translate triangle vertices by (-3,4). This changes angle sizes?', 'no', 'mcq', ['no', 'yes', 'sometimes', 'only if large vector']),
            makeQuestion('C(8, -5) after translation becomes C\'(2, -1). Vector?', '(-6, 4)', 'text'),
            makeQuestion('Vector (a,b) followed by (-a,-b) is net?', '(0, 0)', 'text'),
            makeQuestion('A student adds x-change to y-coordinate. Correct?', 'no', 'mcq', ['no', 'yes', 'only for origin', 'only for integers']),
            makeQuestion('Translate (-2,-3) by (9,12).', '(7, 9)', 'text'),
            makeQuestion('Translate (12,4) by (-15,-2).', '(-3, 2)', 'text'),
            makeQuestion('Translation of (x,y) by (p,q) is?', '(x+p, y+q)', 'text')
        ]),
        year7TranslationHard: createLevel('year7TranslationHard', '7J Translation (Hard)', [
            makeQuestion('A(2,1) to A\'(9,-5) gives vector v. Apply v to (0,0). New point?', '(7, -6)', 'text'),
            makeQuestion('Point P maps by vector (4,-7) then (-9,3). Net vector?', '(-5, -4)', 'text'),
            makeQuestion('P(-6,8) translated to P\'(k,1) by vector (10,-7). Find k.', '4', 'numeric'),
            makeQuestion('If Q(x,y) -> Q\'(x-3, y+11), translation vector is?', '(-3, 11)', 'text'),
            makeQuestion('Triangle translated by (a,b) then (c,d). Equivalent single vector?', '(a+c, b+d)', 'text'),
            makeQuestion('Student says translation can change orientation. Correct?', 'no', 'mcq', ['no', 'yes', 'only with negative vector', 'only with large vector']),
            makeQuestion('R(5,-9) maps to R\'(-1,m) by vector (-6,12). Find m.', '3', 'numeric'),
            makeQuestion('If a translation maps (x,y) to (x+7,y-2), where does (-7,2) map?', '(0, 0)', 'text'),
            makeQuestion('Net effect of translating by (3,4), then (-3,-4), then (1,2)?', '(1, 2)', 'text'),
            makeQuestion('Which transformation keeps all lines parallel to themselves?', 'translation', 'mcq', ['translation', 'reflection', 'rotation', 'enlargement'])
        ]),

        // 7K Drawing solids
        year7DrawingSolidsEasy: createLevel('year7DrawingSolidsEasy', '7K Drawing Solids (Easy)', [
            makeQuestion('How many faces does a cube have?', '6', 'numeric'),
            makeQuestion('How many edges does a cube have?', '12', 'numeric'),
            makeQuestion('How many vertices does a cube have?', '8', 'numeric'),
            makeQuestion('A rectangular prism has how many faces?', '6', 'numeric'),
            makeQuestion('A triangular prism has how many rectangular faces?', '3', 'numeric'),
            makeQuestion('A triangular prism has how many triangular faces?', '2', 'numeric'),
            makeQuestion('A square pyramid has how many vertices?', '5', 'numeric'),
            makeQuestion('A cylinder has how many flat faces?', '2', 'numeric'),
            makeQuestion('A cone has how many vertices?', '1', 'numeric'),
            makeQuestion('A sphere has any edges?', 'no', 'mcq', ['no', 'yes', '2', '1'])
        ]),
        year7DrawingSolidsMedium: createLevel('year7DrawingSolidsMedium', '7K Drawing Solids (Medium)', [
            makeQuestion('Total faces on a square pyramid?', '5', 'numeric'),
            makeQuestion('Edges on a square pyramid?', '8', 'numeric'),
            makeQuestion('Vertices on a triangular prism?', '6', 'numeric'),
            makeQuestion('Edges on a triangular prism?', '9', 'numeric'),
            makeQuestion('A prism has two congruent parallel bases. True?', 'true', 'mcq', ['true', 'false', 'only triangular prism', 'only rectangular prism']),
            makeQuestion('A student says cylinder has vertices. Correct?', 'no', 'mcq', ['no', 'yes', '2 vertices', '1 vertex']),
            makeQuestion('How many faces does a pentagonal prism have?', '7', 'numeric'),
            makeQuestion('How many vertices does a pentagonal prism have?', '10', 'numeric'),
            makeQuestion('How many edges does a pentagonal prism have?', '15', 'numeric'),
            makeQuestion('Choose the non-polyhedron.', 'cylinder', 'mcq', ['cylinder', 'cube', 'triangular prism', 'square pyramid'])
        ]),
        year7DrawingSolidsHard: createLevel('year7DrawingSolidsHard', '7K Drawing Solids (Hard)', [
            makeQuestion('A prism with n-gon base has how many vertices?', '2n', 'text'),
            makeQuestion('A prism with n-gon base has how many faces?', 'n+2', 'text'),
            makeQuestion('A prism with n-gon base has how many edges?', '3n', 'text'),
            makeQuestion('For a hexagonal prism, faces+vertices equals?', '20', 'numeric'),
            makeQuestion('For a hexagonal prism, faces+edges+vertices equals?', '38', 'numeric'),
            makeQuestion('Student claims cone is a prism. Best correction?', 'cone has one circular base and one vertex so it is not a prism', 'mcq', ['cone has one circular base and one vertex so it is not a prism', 'cone is a prism with curved faces', 'all solids are prisms', 'cone has two equal polygonal bases']),
            makeQuestion('Square pyramid: F+V-E equals?', '2', 'numeric'),
            makeQuestion('Triangular prism: F+V-E equals?', '2', 'numeric'),
            makeQuestion('A solid has 8 faces, 18 edges. If polyhedron, vertices = ?', '12', 'numeric'),
            makeQuestion('Which relation is Euler\'s formula for polyhedra?', 'F+V-E=2', 'mcq', ['F+V-E=2', 'F+E-V=2', 'F+V+E=2', '2F=V+E'])
        ]),

        // 7L Nets of solids
        year7NetsOfSolidsEasy: createLevel('year7NetsOfSolidsEasy', '7L Nets of Solids (Easy)', [
            makeQuestion('A net is a 2D pattern that folds to a?', '3d solid', 'mcq', ['3d solid', 'line', 'angle', 'graph']),
            makeQuestion('A cube net uses how many squares?', '6', 'numeric'),
            makeQuestion('A triangular prism net includes how many triangles?', '2', 'numeric'),
            makeQuestion('A triangular prism net includes how many rectangles?', '3', 'numeric'),
            makeQuestion('A square pyramid net includes how many triangles?', '4', 'numeric'),
            makeQuestion('A square pyramid net includes how many squares?', '1', 'numeric'),
            makeQuestion('A cylinder net has how many circles?', '2', 'numeric'),
            makeQuestion('A cylinder net also has what curved-surface piece?', 'rectangle', 'mcq', ['rectangle', 'triangle', 'pentagon', 'trapezium']),
            makeQuestion('A cone net has one circle and one?', 'sector', 'mcq', ['sector', 'square', 'triangle', 'rectangle']),
            makeQuestion('Can every arrangement of six squares fold to a cube?', 'no', 'mcq', ['no', 'yes', 'only if in one row', 'only if in rectangle'])
        ]),
        year7NetsOfSolidsMedium: createLevel('year7NetsOfSolidsMedium', '7L Nets of Solids (Medium)', [
            makeQuestion('A rectangular prism net has how many rectangular faces total?', '6', 'numeric'),
            makeQuestion('A pentagonal prism net has how many rectangular side faces?', '5', 'numeric'),
            makeQuestion('A pentagonal prism net has total faces?', '7', 'numeric'),
            makeQuestion('Student says a cube net can have overlapping faces when folded. Valid net?', 'no', 'mcq', ['no', 'yes', 'sometimes', 'only with glue tabs']),
            makeQuestion('A triangular pyramid (tetrahedron) net has how many triangles?', '4', 'numeric'),
            makeQuestion('A net missing one face will fold to a closed solid?', 'no', 'mcq', ['no', 'yes', 'only for prisms', 'only for pyramids']),
            makeQuestion('For a cylinder net, the rectangle length equals the base circle?', 'circumference', 'mcq', ['circumference', 'diameter', 'radius', 'area']),
            makeQuestion('A cube has how many distinct valid nets in total?', '11', 'numeric'),
            makeQuestion('A student confuses prism and pyramid nets. Prism side faces are mostly?', 'rectangles', 'mcq', ['rectangles', 'triangles', 'sectors', 'circles']),
            makeQuestion('A square pyramid net has base shape?', 'square', 'mcq', ['square', 'triangle', 'rectangle', 'circle'])
        ]),
        year7NetsOfSolidsHard: createLevel('year7NetsOfSolidsHard', '7L Nets of Solids (Hard)', [
            makeQuestion('A prism net has 14 vertices total across separate faces before folding. Not enough alone to identify solid?', 'true', 'mcq', ['true', 'false', 'always enough', 'never true']),
            makeQuestion('Hexagonal prism net has how many rectangular side faces?', '6', 'numeric'),
            makeQuestion('Hexagonal prism net total faces?', '8', 'numeric'),
            makeQuestion('A solid\'s net has one hexagon and six rectangles and one more hexagon. Solid is?', 'hexagonal prism', 'mcq', ['hexagonal prism', 'hexagonal pyramid', 'cube', 'cylinder']),
            makeQuestion('Cone net sector arc length equals?', 'circumference of base circle', 'mcq', ['circumference of base circle', 'radius of base circle', 'diameter of base circle', 'area of base circle']),
            makeQuestion('Student says all nets with same faces fold to same solid. Correct?', 'no arrangement matters', 'mcq', ['no arrangement matters', 'yes always', 'yes for prisms only', 'yes for cubes only']),
            makeQuestion('A square pyramid net has one square and four equal triangles. Total faces when folded?', '5', 'numeric'),
            makeQuestion('A triangular prism net has 5 faces. True or false?', 'true', 'mcq', ['true', 'false', 'only if right prism', 'cannot tell']),
            makeQuestion('Which condition invalidates a net?', 'faces overlap when folded', 'mcq', ['faces overlap when folded', 'has congruent bases', 'has rectangles', 'has equal edges']),
            makeQuestion('Cube nets count (distinct) is?', '11', 'numeric')
        ])
    };

    window.AlgebraLevels = window.AlgebraLevels || {};
    Object.keys(levels).forEach((key) => {
        window.AlgebraLevels[key] = levels[key];
    });
})();
