-- Executable adaptation of Appendix B.2, arXiv:2604.14536v1.
-- Uses the relations of Theorem 5.10. Commutativity gives a21=a12.
-- The source's local index named s shadows its coefficient s in prodE;
-- here sigma is the coefficient, and indices are a,b,c,d throughout.
R = ZZ[symbol a11,symbol a12,symbol a22,symbol a13,symbol a14,symbol a23];
S = R[symbol e00,symbol e10,symbol e20,symbol e01,symbol e11,
      symbol e21,symbol e02,symbol e12,symbol e22,symbol alpha,
      MonomialOrder => Lex];
sigma = 57*a11^3 + 51*a11*a12 - 51*a22 + 102*a13;
ee = {e00,e10,e20,e01,e11,e21,e02,e12,e22};
getE = (a,b) -> (
    if a >= 3 or b >= 5 then 0_S
    else if b == 3 then -9*getE(a+1,2)-6*a11*getE(a+2,2)-30*getE(a+2,1)
    else if b == 4 then 51*getE(a+2,2)
    else ee#(a+3*b)
);
prodE = (a,b,c,d) -> (
    -getE(a+c,b+d+1) + a11*getE(a+c,b+d+2)
    + 30*a11^2*getE(a+c+2,b+d+1)
    + 9*a11^2*getE(a+c+1,b+d+2)
    + sigma*getE(a+c+2,b+d+2)
);
mixedRels = flatten apply(toList(0..2),a -> apply(toList(0..2),b ->
    alpha*getE(a,b)-2*getE(a+1,b)-a11*getE(a+2,b)));
exceptRels = flatten flatten flatten apply(toList(0..2),a -> apply(toList(0..2),b ->
    apply(toList(0..2),c -> apply(toList(0..2),d -> getE(a,b)*getE(c,d)-prodE(a,b,c,d)))));
excessRels = {
    4*alpha^3+3*a11*alpha^4+3*a12*alpha^5
      -(30*e20+9*e11+e02+66*a11*e21+9*a11*e12+78*a11^2*e22),
    2*alpha^4+a11*alpha^5-(9*e21+e12+9*a11*e22),
    alpha^5-e22
};
I = ideal join({alpha^6},mixedRels,exceptRels,excessRels);
ABlVP5 = S/I;
use ABlVP5;
-- Retain every formal-group monomial through divisor length five.
-- This computes T itself, as well as all powers through T^5.
-- Terms of length six vanish on the five-dimensional complete-conic space.
F = (x,y) -> (x+y+a11*x*y+a12*(x^2*y+x*y^2)
                +a13*(x^3*y+x*y^3)+a22*x^2*y^2
                +a14*(x^4*y+x*y^4)+a23*(x^3*y^2+x^2*y^3));
invF = x -> (
    y := -x;
    for k from 1 to 5 do y = y-F(x,y);
    y
);
nF = (n,x) -> (
    y := 0_ABlVP5;
    for k from 1 to n do y=F(y,x);
    y
);
class6A = nF(6,alpha);
class2E = nF(2,e00);
minus2E = invF(class2E);
T = F(class6A,minus2E);
assert(F(class2E,minus2E) == 0);
solution = T^5;
assert(e11*e11 == 0);
assert(alpha*e22 == 0);
assert(alpha^5 == e22);
assert(solution == 3264*alpha^5);
assert(alpha^5 != 0_ABlVP5);
print toString solution;
