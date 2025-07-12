const { logger } = require("./src/shared/util");

beforeAll(() => {
    jest.spyOn(logger, "info").mockImplementation(() => {});
    jest.spyOn(logger, "error").mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});
