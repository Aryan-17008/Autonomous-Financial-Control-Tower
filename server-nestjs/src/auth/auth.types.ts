/**
 * Shape of the authenticated user attached to the request by JwtAuthGuard.
 * Also the JWT payload claims (minus iat/exp) we sign and verify.
 */
export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

/**
 * JWT payload format (HS256, standard compact JWT):
 *   header:  { alg: "HS256", typ: "JWT" }
 *   payload: { sub: "<user id as string>", email, role, iat, exp }
 * Client sends: Authorization: Bearer <token>
 *
 * Verify with the shared secret (env JWT_SECRET). iat/exp are standard
 * registered claims added automatically by @nestjs/jwt.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
