-- Integral Chow presentation of the moduli space of complete conics.
-- Chow specialization of Theorem 5.10, arXiv:2604.14536v1.
-- e00, e10, e20 denote e_{0,0}, e_{1,0}, e_{2,0}.
R = ZZ[symbol e00,symbol e10,symbol e20,symbol alpha,
       MonomialOrder=>Lex];
I = ideal(alpha^6,
    alpha*e00-2*e10, alpha*e10-2*e20, alpha*e20,
    e10^2-e00*e20, e10*e20, e20^2,
    e00^3-9*e00*e10+30*e20-4*alpha^3,
    e00^2*e10-9*e00*e20-2*alpha^4,
    e00^2*e20-alpha^5);
CH = R/I;
use CH;
solution = (6*alpha-2*e00)^5;
assert(solution == 3264*alpha^5);
assert(alpha^5 != 0_CH);
-- Independent projective-bundle calculation of the six top intersections.
S = ZZ[symbol zz,symbol eta,MonomialOrder=>Lex];
B = S/ideal(eta^3, zz^3+9*eta*zz^2+30*eta^2*zz);
degE = f -> coefficient(S_0^2*S_1^2,lift(f,S));
mixed = {1} | apply(toList(1..5),k ->
    (-1)^(k-1)*degE((2*eta)^(5-k)*zz^(k-1)));
assert(mixed == {1,0,0,4,18,51});
assert(all(toList(0..5),k ->
    (CH_3)^(5-k)*(CH_0)^k == mixed#k*(CH_3)^5));
print toString solution;
count = coefficient(R_3^5,lift(solution,R));
assert(count == 3264);
print count;
