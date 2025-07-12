import jwt from "jsonwebtoken";
import { ITokenService } from "../../application/service";
import { TokenService } from "../../infrastructure/service";

jest.mock("jsonwebtoken", () => {
    return {
        sign: jest
            .fn()
            .mockReturnValue(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU",
            ),
    };
});

describe("Testing Token Service", () => {
    const [userId, name, role, expires, token] = [
        "5a53d571-f85b-4373-8935-bc7eefab74f6",
        "Test User",
        "Front Office",
        "4h",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU",
    ];

    let tokenService: ITokenService;

    beforeEach(() => {
        jest.clearAllMocks();
        tokenService = new TokenService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Generate Token", () => {
        it("should success return generate token", async () => {
            const generatedToken = await tokenService.generateToken(
                userId,
                name,
                role,
            );

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id_user: userId,
                    nama: name,
                    role: role,
                },
                expect.anything(),
                {
                    expiresIn: expires,
                    issuer: expect.anything(),
                },
            );
            expect(generatedToken).toEqual(token);
        });
    });
});
