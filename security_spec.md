# Security Specification for Gestão de Vendas Marcio Sanchez

## 1. Data Invariants
- A `SellerRecord` document must containing an `id` that matches the document key.
- Required fields are `id`, `sellerName`, `city`, `segment`, `currentClients`, and `createdAt`.
- Fields must match specified types and length constraints to avoid Denial-of-Wallet or storage injection attacks.

## 2. Dirty Dozen Payloads
Below are 12 malicious payloads designed to violate identity and schema rules, which must all be denied:
1. **Omit Required ID**: `{ sellerName: "Test", city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31" }`
2. **Omit Required Name**: `{ id: "seller-123", city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31" }`
3. **Invalid ID Type**: `{ id: true, sellerName: "Test", city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31" }`
4. **Invalid Name Type**: `{ id: "seller-123", sellerName: 12345, city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31" }`
5. **Gigantic Name (Dos-of-Wallet)**: `{ id: "seller-123", sellerName: "A...[10MB]", city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31" }`
6. **Negative Clients count**: `{ id: "seller-123", sellerName: "Test", city: "Campinas", segment: "Varejo", currentClients: -50, createdAt: "2026-05-31" }`
7. **Malformed Phone Number**: `{ id: "seller-123", sellerName: "Test", phone: 1213123, city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31" }`
8. **Invalid Segment Type**: `{ id: "seller-123", sellerName: "Test", city: "Campinas", segment: true, currentClients: 10, createdAt: "2026-05-31" }`
9. **Injecting Ghost Fields**: `{ id: "seller-123", sellerName: "Test", city: "Campinas", segment: "Varejo", currentClients: 10, createdAt: "2026-05-31", surpriseGhostField: "unauthorized_data" }`
10. **Malformed Path ID (Path Poisoning)**: Path variable contains bad symbols like `/` or whitespace.
11. **Client Timestamp Injection**: Setting non-string dates or malicious objects in createdAt.
12. **Malicious Analysis Injection**: Embedding corrupt analysis shapes with extreme sizes.

## 3. Test Cases (TDD Verification)
Security rules must guarantee that any input with these attributes is immediately rejected during write operations.
