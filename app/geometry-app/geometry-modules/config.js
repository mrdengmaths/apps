// algebra-modules/config.js
const CONFIG = {
    LEVEL_GROUPS: {
        "Year 7 Geometry": [
            { key: 'year7PointsLinesAnglesEasy', name: '7A Points, Lines, Intervals & Angles<br>🥉', value: '7a-easy' },
            { key: 'year7PointsLinesAnglesMedium', name: '7A Points, Lines, Intervals & Angles<br>🥈', value: '7a-medium' },
            { key: 'year7PointsLinesAnglesHard', name: '7A Points, Lines, Intervals & Angles<br>🥇', value: '7a-hard' },

            { key: 'year7AdjacentVerticallyOppositeEasy', name: '7B Adjacent & Vertically Opposite Angles<br>🥉', value: '7b-easy' },
            { key: 'year7AdjacentVerticallyOppositeMedium', name: '7B Adjacent & Vertically Opposite Angles<br>🥈', value: '7b-medium' },
            { key: 'year7AdjacentVerticallyOppositeHard', name: '7B Adjacent & Vertically Opposite Angles<br>🥇', value: '7b-hard' },

            { key: 'year7TransversalParallelEasy', name: '7C Transversal & Parallel Lines<br>🥉', value: '7c-easy' },
            { key: 'year7TransversalParallelMedium', name: '7C Transversal & Parallel Lines<br>🥈', value: '7c-medium' },
            { key: 'year7TransversalParallelHard', name: '7C Transversal & Parallel Lines<br>🥇', value: '7c-hard' },

            { key: 'year7ParallelProblemsEasy', name: '7D Parallel-Line Geometry Problems<br>🥉', value: '7d-easy' },
            { key: 'year7ParallelProblemsMedium', name: '7D Parallel-Line Geometry Problems<br>🥈', value: '7d-medium' },
            { key: 'year7ParallelProblemsHard', name: '7D Parallel-Line Geometry Problems<br>🥇', value: '7d-hard' },

            { key: 'year7TrianglesEasy', name: '7E Classify & Construct Triangles<br>🥉', value: '7e-easy' },
            { key: 'year7TrianglesMedium', name: '7E Classify & Construct Triangles<br>🥈', value: '7e-medium' },
            { key: 'year7TrianglesHard', name: '7E Classify & Construct Triangles<br>🥇', value: '7e-hard' },

            { key: 'year7QuadrilateralsPolygonsEasy', name: '7F Classify Quadrilaterals & Polygons<br>🥉', value: '7f-easy' },
            { key: 'year7QuadrilateralsPolygonsMedium', name: '7F Classify Quadrilaterals & Polygons<br>🥈', value: '7f-medium' },
            { key: 'year7QuadrilateralsPolygonsHard', name: '7F Classify Quadrilaterals & Polygons<br>🥇', value: '7f-hard' },

            { key: 'year7TriangleAngleSumEasy', name: '7G Angle Sum of a Triangle<br>🥉', value: '7g-easy' },
            { key: 'year7TriangleAngleSumMedium', name: '7G Angle Sum of a Triangle<br>🥈', value: '7g-medium' },
            { key: 'year7TriangleAngleSumHard', name: '7G Angle Sum of a Triangle<br>🥇', value: '7g-hard' },

            { key: 'year7SymmetryEasy', name: '7H Symmetry (Consolidating)<br>🥉', value: '7h-easy' },
            { key: 'year7SymmetryMedium', name: '7H Symmetry (Consolidating)<br>🥈', value: '7h-medium' },
            { key: 'year7SymmetryHard', name: '7H Symmetry (Consolidating)<br>🥇', value: '7h-hard' },

            { key: 'year7ReflectionRotationEasy', name: '7I Reflection & Rotation (Consolidating)<br>🥉', value: '7i-easy' },
            { key: 'year7ReflectionRotationMedium', name: '7I Reflection & Rotation (Consolidating)<br>🥈', value: '7i-medium' },
            { key: 'year7ReflectionRotationHard', name: '7I Reflection & Rotation (Consolidating)<br>🥇', value: '7i-hard' },

            { key: 'year7TranslationEasy', name: '7J Translation (Consolidating)<br>🥉', value: '7j-easy' },
            { key: 'year7TranslationMedium', name: '7J Translation (Consolidating)<br>🥈', value: '7j-medium' },
            { key: 'year7TranslationHard', name: '7J Translation (Consolidating)<br>🥇', value: '7j-hard' },

            { key: 'year7DrawingSolidsEasy', name: '7K Drawing Solids<br>🥉', value: '7k-easy' },
            { key: 'year7DrawingSolidsMedium', name: '7K Drawing Solids<br>🥈', value: '7k-medium' },
            { key: 'year7DrawingSolidsHard', name: '7K Drawing Solids<br>🥇', value: '7k-hard' },

            { key: 'year7NetsOfSolidsEasy', name: '7L Nets of Solids<br>🥉', value: '7l-easy' },
            { key: 'year7NetsOfSolidsMedium', name: '7L Nets of Solids<br>🥈', value: '7l-medium' },
            { key: 'year7NetsOfSolidsHard', name: '7L Nets of Solids<br>🥇', value: '7l-hard' }
        ]
    },
    REQUIRED_STREAK: 10,
    FEEDBACK_DELAY_CORRECT: 300,
    FEEDBACK_DELAY_INCORRECT: 1000,
    POSITIVE_FEEDBACK: ["Awesome!", "Great Job!", "You got it!", "Fantastic!", "Brilliant!", "Keep it up!", "Nice!", "Correct!"],
    SECOND_CHANCE_FEEDBACK: ["Try again", "Not quite right", "Have another go!", "Take another shot at it!"],
    RATING_THRESHOLDS: [
        { maxAvg: 1.5, name: "💖 Maths Queen 💖", key: "true-mastery" },
        { maxAvg: 2.5, name: "Mastery", key: "mastery" },
        { maxAvg: 3.5, name: "Expert", key: "expert" },
        { maxAvg: 5, name: "Developing", key: "developing" },
        { maxAvg: Infinity, name: "Beginner", key: "beginner" }
    ],
    LEVEL_DIFFICULTY_MULTIPLIERS: {
        year7PointsLinesAnglesEasy: 1.5,
        year7PointsLinesAnglesMedium: 2.2,
        year7PointsLinesAnglesHard: 3.2,

        year7AdjacentVerticallyOppositeEasy: 1.6,
        year7AdjacentVerticallyOppositeMedium: 2.4,
        year7AdjacentVerticallyOppositeHard: 3.5,

        year7TransversalParallelEasy: 1.8,
        year7TransversalParallelMedium: 2.8,
        year7TransversalParallelHard: 4.0,

        year7ParallelProblemsEasy: 2.0,
        year7ParallelProblemsMedium: 3.0,
        year7ParallelProblemsHard: 4.4,

        year7TrianglesEasy: 1.8,
        year7TrianglesMedium: 2.8,
        year7TrianglesHard: 4.2,

        year7QuadrilateralsPolygonsEasy: 1.8,
        year7QuadrilateralsPolygonsMedium: 2.8,
        year7QuadrilateralsPolygonsHard: 4.2,

        year7TriangleAngleSumEasy: 1.8,
        year7TriangleAngleSumMedium: 2.8,
        year7TriangleAngleSumHard: 4.2,

        year7SymmetryEasy: 1.7,
        year7SymmetryMedium: 2.7,
        year7SymmetryHard: 4.0,

        year7ReflectionRotationEasy: 1.8,
        year7ReflectionRotationMedium: 2.8,
        year7ReflectionRotationHard: 4.0,

        year7TranslationEasy: 1.8,
        year7TranslationMedium: 2.7,
        year7TranslationHard: 3.8,

        year7DrawingSolidsEasy: 1.8,
        year7DrawingSolidsMedium: 2.8,
        year7DrawingSolidsHard: 4.3,

        year7NetsOfSolidsEasy: 2.0,
        year7NetsOfSolidsMedium: 3.0,
        year7NetsOfSolidsHard: 4.6
    },
    STORAGE_PREFIX: 'geometry_bestTime_v1_',
    CONFETTI: { CORRECT: 40, SUCCESS: 150 }
};
