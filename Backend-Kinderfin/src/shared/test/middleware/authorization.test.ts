import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { DefaultMessage } from "../../abstract";
import { restrictedTo } from "../../middleware";

jest.mock("jsonwebtoken", () => {
    return {
        verify: jest.fn().mockReturnValue({
            id_user: "5a53d571-f85b-4373-8935-bc7eefab74f6",
            role: "Front Office",
        }),
    };
});

describe("Testing Authorization Middleware", () => {
    const [allowedRoles, role, forbiddenRole] = [
        ["Manajer", "Administrator Keuangan"],
        "Administrator Keuangan",
        "Front Office",
    ];

    const forbiddenAccessMessage = {
        status: "failed",
        error: DefaultMessage.ERR_AUTH_ROLE,
    };

    let mockRequest: Request;
    let mockResponse: Response;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = httpMocks.createRequest();
        mockResponse = httpMocks.createResponse({
            locals: Object.assign({}, { role: role }),
        });
        mockResponse.json = jest.fn();
        mockNext = jest.fn() as unknown as NextFunction;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should success pass authorization middleware", () => {
        const middlewareAuthorization = restrictedTo(...allowedRoles);
        middlewareAuthorization(mockRequest, mockResponse, mockNext);

        expect(allowedRoles.includes(mockResponse.locals.role)).toBeTruthy();
        expect(mockNext).toHaveBeenCalled();
    });

    it("should error pass authorization middleware", () => {
        mockResponse.locals.role = forbiddenRole;

        const middlewareAuthorization = restrictedTo(...allowedRoles);
        middlewareAuthorization(mockRequest, mockResponse, mockNext);

        expect(allowedRoles.includes(mockResponse.locals.role)).toBeFalsy();
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.header("Content-Type")).toEqual("application/json");
        expect(mockResponse.statusCode).toEqual(StatusCodes.FORBIDDEN);
        expect(mockResponse.json).toHaveBeenCalledWith(forbiddenAccessMessage);
    });
});
