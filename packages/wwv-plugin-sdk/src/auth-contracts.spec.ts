 
import { describe, it, expectTypeOf } from "vitest";
import type {
    TokenExchangeRequest,
    TokenExchangeResponse,
    WebSocketAuthMessage,
    SensitiveString,
    PluginTicket,
    Tier,
    PKCEConnectRequest,
    PKCETokenExchange,
    PKCETokenExchangeResponse,
    PluginJwtClaims,
    AuthErrorResponse,
    JWK,
    JWKSResponse,
    WebSocketMessage
} from "./auth-contracts";

describe("Auth Contracts", () => {
    it("TokenExchangeRequest has exact required properties", () => {
        expectTypeOf<TokenExchangeRequest>().toHaveProperty("apiKey").toEqualTypeOf<SensitiveString>();
        expectTypeOf<TokenExchangeRequest>().toHaveProperty("audience").toEqualTypeOf<string>();

        // @ts-expect-error - missing required apiKey
        const _badReq: TokenExchangeRequest = { audience: "engine-123" };
        void _badReq;
    });

    it("TokenExchangeResponse has exact required properties", () => {
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("token").toEqualTypeOf<SensitiveString>();
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("expiresAt").toEqualTypeOf<number>();
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("kid").toEqualTypeOf<string>();
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("tier").toEqualTypeOf<Tier | undefined>();

        // @ts-expect-error - missing required token
        const _badRes: TokenExchangeResponse = { expiresAt: 123456789, kid: "key-1" };
        void _badRes;
    });

    it("WebSocketAuthMessage has exact required properties including protocol version", () => {
        expectTypeOf<WebSocketAuthMessage>().toHaveProperty("type").toEqualTypeOf<"auth">();
        expectTypeOf<WebSocketAuthMessage>().toHaveProperty("v").toEqualTypeOf<1>();
        expectTypeOf<WebSocketAuthMessage>().toHaveProperty("token").toEqualTypeOf<PluginTicket>();

        // @ts-expect-error - missing version
        const _badMsg: WebSocketAuthMessage = { type: "auth", token: "jwt-token-here" as SensitiveString };
        void _badMsg;
        
        // @ts-expect-error - wrong version
        const _badVersion: WebSocketAuthMessage = { type: "auth", v: 2, token: "jwt-token-here" as SensitiveString };
        void _badVersion;
    });

    it("WebSocketMessage is a discriminated union correctly containing WebSocketAuthMessage", () => {
        expectTypeOf<WebSocketMessage>().extract<{ type: "auth" }>().toEqualTypeOf<WebSocketAuthMessage>();
    });

    it("PKCEConnectRequest has correct snake_case shape", () => {
        expectTypeOf<PKCEConnectRequest>().toHaveProperty("state").toEqualTypeOf<string>();
        expectTypeOf<PKCEConnectRequest>().toHaveProperty("code_challenge").toEqualTypeOf<string>();
        expectTypeOf<PKCEConnectRequest>().toHaveProperty("code_challenge_method").toEqualTypeOf<"S256">();
    });

    it("PKCETokenExchange implements RFC 7636 fields", () => {
        expectTypeOf<PKCETokenExchange>().toHaveProperty("grant_type").toEqualTypeOf<"authorization_code">();
        expectTypeOf<PKCETokenExchange>().toHaveProperty("redirect_uri").toEqualTypeOf<string>();
        expectTypeOf<PKCETokenExchange>().toHaveProperty("client_id").toEqualTypeOf<string>();
        expectTypeOf<PKCETokenExchange>().toHaveProperty("code").toEqualTypeOf<string>();
        expectTypeOf<PKCETokenExchange>().toHaveProperty("code_verifier").toEqualTypeOf<string>();
    });

    it("PKCETokenExchangeResponse has exact required properties", () => {
        expectTypeOf<PKCETokenExchangeResponse>().toHaveProperty("apiKey").toEqualTypeOf<SensitiveString>();
        expectTypeOf<PKCETokenExchangeResponse>().toHaveProperty("tier").toEqualTypeOf<Tier | undefined>();
        expectTypeOf<PKCETokenExchangeResponse>().toHaveProperty("issuedAt").toEqualTypeOf<number | undefined>();
    });

    it("PluginJwtClaims structure matches requirements", () => {
        expectTypeOf<PluginJwtClaims>().toHaveProperty("iss").toEqualTypeOf<string>();
        expectTypeOf<PluginJwtClaims>().toHaveProperty("aud").toEqualTypeOf<string>();
        expectTypeOf<PluginJwtClaims>().toHaveProperty("exp").toEqualTypeOf<number>();
        expectTypeOf<PluginJwtClaims>().toHaveProperty("jti").toEqualTypeOf<string>();
        expectTypeOf<PluginJwtClaims>().toHaveProperty("tier").toEqualTypeOf<Tier>();
        expectTypeOf<PluginJwtClaims>().toHaveProperty("plugins").toEqualTypeOf<string[] | undefined>();
    });

    it("JWKSResponse conforms to RFC 7517", () => {
        expectTypeOf<JWKSResponse>().toHaveProperty("keys").toEqualTypeOf<JWK[]>();
        expectTypeOf<JWK>().toHaveProperty("kty").toEqualTypeOf<string>();
        expectTypeOf<JWK>().toHaveProperty("kid").toEqualTypeOf<string>();
    });

    it("AuthErrorResponse has basic OAuth error fields", () => {
        expectTypeOf<AuthErrorResponse>().toHaveProperty("error").toEqualTypeOf<string>();
        expectTypeOf<AuthErrorResponse>().toHaveProperty("error_description").toEqualTypeOf<string>();
    });
});
