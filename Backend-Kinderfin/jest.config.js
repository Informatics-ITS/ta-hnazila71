/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testTimeout: 10000,
    testMatch: ["./**/*.test.ts"],
    setupFilesAfterEnv: ["./jest.setup.js"],
    verbose: true,
    forceExit: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: [
        ".src/app.ts",
        ".src/server.ts",
        ".src/config",
        ".src/.*/index.ts",
        ".src/.*/router.ts",
        ".src/.*/mapper",
        ".src/.*/infrastructure/migration",
        ".src/shared/abstract",
        ".src/shared/util",
        ".src/shared/middleware/uploader.ts",
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
};
