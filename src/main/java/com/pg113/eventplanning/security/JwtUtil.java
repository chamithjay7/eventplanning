package com.pg113.eventplanning.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret:changeme_super_secret_256bit_key_changeme_super_secret_256bit_key}")
    private String secretBase64;

    @Value("${app.jwt.expiration-ms:86400000}") // 24h
    private long expirationMs;

    private Key getSigningKey() {
        // Accept both raw text or base64-encoded secret; prefer base64
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secretBase64);
        } catch (IllegalArgumentException e) {
            keyBytes = secretBase64.getBytes();
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Generate a token with a single role string. */
    public String generateToken(String username, String role) {
        return generateToken(username, List.of(role));
    }

    /** Generate a token with multiple roles. */
    public String generateToken(String username, List<String> roles) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(username)
                .addClaims(Map.of("roles", roles))
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration() != null && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        try {
            Object roles = extractAllClaims(token).get("roles");
            if (roles instanceof List<?> list) {
                return (List<String>) list;
            }
            return List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
