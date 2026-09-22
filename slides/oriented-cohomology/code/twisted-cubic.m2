-- Theorem 3.9 applied to the twisted cubic, followed by Theorem 4.10.
-- Symbolic coefficients map to those of the chosen theory in A*(pt).
-- The presentation itself implies (alpha,e)^4=0; no dimension axiom is needed.
R = ZZ[symbol a11,symbol a12];

-- Normal Chern classes and the exceptional-divisor presentation.
EN0 = R[symbol etaE,symbol zetaE];
EN = EN0/ideal(etaE^2,zetaE^2+10*etaE*zetaE);
use EN;
assert(zetaE^3 == 0_EN);
inverseE = -zetaE+a11*zetaE^2;
assert(inverseE == -zetaE-10*a11*etaE*zetaE);
chernQ = 10*etaE-inverseE;
assert(chernQ == zetaE+10*etaE+10*a11*etaE*zetaE);

-- The final quotient in Theorem 4.8, with every relation written explicitly.
S = R[symbol e,symbol x,symbol z,symbol alpha,MonomialOrder=>Lex];
I = ideal(alpha^4,alpha^2*e,alpha*e-3*x,alpha*x,
    alpha*z-3*alpha^3,z^2,x^2,x*z,
    e^2+z+10*a11*alpha^3,e*x+alpha^3,e*z-10*alpha^3,
    3*alpha^2-z-10*x-8*a11*alpha^3);
A = S/I;

-- Independently retain all four exceptional pushforwards.
-- uTop represents j_*(etaE*zetaE); family (iv) will identify it with alpha^3.
U = R[symbol uE,symbol uX,symbol uZ,symbol uTop,symbol uAlpha,
      MonomialOrder=>Lex];
J = ideal(
    -- (i) Ambient products.
    uAlpha^4,
    -- (ii) Mixed products.
    uAlpha*uE-3*uX,uAlpha*uX,uAlpha*uZ-3*uTop,
    uAlpha*uTop,uAlpha^2*uE,
    -- (iii) Exceptional products.
    uE^2+uZ+10*a11*uTop,uE*uX+uTop,uE*uZ-10*uTop,
    uX^2,uX*uZ,uZ^2,uE*uTop,uX*uTop,uZ*uTop,uTop^2,
    -- (iv) Excess for etaE and for 1.
    uTop-uAlpha^3,
    3*uAlpha^2+2*a11*uAlpha^3-uZ-10*uX-10*a11*uTop);
B = U/J;
forward = map(A,U,{A_0,A_1,A_2,A_3^3,A_3});
backward = map(B,S,{B_0,B_1,B_2,B_4});
assert(forward J == ideal(0_A));
assert(backward I == ideal(0_B));
assert(B_3 == B_4^3);

-- Evaluate the formal-group expression with a11 and a12 still symbolic.
use A;
F = (u,v) -> u+v+a11*u*v+a12*(u^2*v+u*v^2);
nF = (n,u) -> (v:=0_A; for k from 1 to n do v=F(v,u); v);
invF = u -> (v:=-u; for k from 1 to 3 do v=v-F(u,v); v);
T = F(nF(4,alpha),invF(nF(2,e)));
assert(alpha^2*e == 0_A);
assert(alpha*e^2 == -3*alpha^3);
assert(e^3 == -10*alpha^3);
assert((ideal(alpha,e))^4 == ideal(0_A));
solution = T^2*alpha;
assert(solution == 4*alpha^3);
assert(alpha^3 != 0_A);
print toString solution;
