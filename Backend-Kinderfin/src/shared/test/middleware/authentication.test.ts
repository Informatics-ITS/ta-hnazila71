import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import * as httpMocks from "node-mocks-http";
import { ApplicationError, DefaultMessage } from "../../abstract";
import { middlewareAuthentication } from "../../middleware";

jest.mock("jsonwebtoken", () => {
    return {
        verify: jest.fn().mockReturnValue({
            id_user: "5a53d571-f85b-4373-8935-bc7eefab74f6",
            role: "Front Office",
        }),
    };
});

describe("Testing Authentication Middleware", () => {
    const [loginToken, falseLoginToken, accessToken, userId, role] = [
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU",
        "Bearer1 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU",
        "5a53d571-f85b-4373-8935-bc7eefab74f6",
        "Front Office",
    ];

    const failedLoginMessage = {
        emptyToken: {
            status: "failed",
            error: DefaultMessage.ERR_AUTH_TOKEN,
        },
        invalidToken: {
            status: "failed",
            error: DefaultMessage.ERR_INVALID_TOKEN,
        },
    };

    let mockRequest: Request;
    let mockResponse: Response;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = httpMocks.createRequest({
            headers: Object.assign({}, { authorization: loginToken }),
        });
        mockResponse = httpMocks.createResponse();
        mockResponse.json = jest.fn();
        mockNext = jest.fn() as unknown as NextFunction;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should success pass authentication middleware", () => {
        middlewareAuthentication(mockRequest, mockResponse, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(accessToken, expect.anything());
        expect(mockResponse.locals.id_user).toEqual(userId);
        expect(mockResponse.locals.role).toEqual(role);
        expect(mockNext).toHaveBeenCalled();
    });

    it("should error pass authentication middleware on token type not bearer", () => {
        mockRequest = httpMocks.createRequest({
            headers: Object.assign({}, { authorization: falseLoginToken }),
        });
        middlewareAuthentication(mockRequest, mockResponse, mockNext);

        expect(jwt.verify).not.toHaveBeenCalled();
        expect(mockResponse.locals.id_user).toBeUndefined();
        expect(mockResponse.locals.role).toBeUndefined();
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.header("Content-Type")).toEqual("application/json");
        expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        expect(mockResponse.json).toHaveBeenCalledWith(
            failedLoginMessage.emptyToken,
        );
    });

    it("should error pass authentication middleware on token not found", () => {
        mockRequest = httpMocks.createRequest({
            headers: Object.assign({}, { authorization: undefined }),
        });

        middlewareAuthentication(mockRequest, mockResponse, mockNext);

        expect(jwt.verify).not.toHaveBeenCalled();
        expect(mockResponse.locals.id_user).toBeUndefined();
        expect(mockResponse.locals.role).toBeUndefined();
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.header("Content-Type")).toEqual("application/json");
        expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        expect(mockResponse.json).toHaveBeenCalledWith(
            failedLoginMessage.emptyToken,
        );
    });

    it("should error pass authentication middleware on failed verify token", () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new ApplicationError(
                StatusCodes.UNAUTHORIZED,
                DefaultMessage.ERR_INVALID_TOKEN,
            );
        });

        middlewareAuthentication(mockRequest, mockResponse, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(accessToken, expect.anything());
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockResponse.header("Content-Type")).toEqual("application/json");
        expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        expect(mockResponse.json).toHaveBeenCalledWith(
            failedLoginMessage.invalidToken,
        );
    });
});
