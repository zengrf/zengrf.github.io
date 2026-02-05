---
title: "A Theorem a Day"
date: 2025-11-20
tags: [projects, collaboration]
---

## 11-20-2025

### (Bachmann-Wickelgren) $\mathbb A^1$-EULER CLASSES: SIX FUNCTORS FORMALISMS, DUALITIES, INTEGRALITY AND LINEAR SUBSPACES OF COMPLETE INTERSECTIONS

**Theorem 5.11.** <i>Suppose $X$ is smooth and proper over $\mathbb{Z}[1 / 2]$. Let $V$ be a relatively oriented vector bundle on $X$ and let $V_k$ denote the base change of $V$ to $k$ for any field $k$. Then either

$$
n^{\mathrm{GS}}\left(V_k, \rho\right)=\frac{n_{\mathbb{C}}+n_{\mathbb{R}}}{2}+\frac{n_{\mathbb{C}}-n_{\mathbb{R}}}{2}\langle-1\rangle
$$

or

$$
n^{\mathrm{GS}}\left(V_k, \rho\right)=\frac{n_{\mathbb{C}}+n_{\mathbb{R}}}{2}+\frac{n_{\mathbb{C}}-n_{\mathbb{R}}}{2}\langle-1\rangle+\langle 2\rangle-1,
$$

where the same formula holds for all fields $k$ of characteristic $\neq 2$.
If instead $X$ is smooth proper over $\mathbb{Z}$, then (6) holds for any field $k$ (including fields $k$ of characteristic two).</i>

Recall that for the last claim regarding $X$ smooth and proper over $\mathbb{Z}$, we rely on [ $\mathrm{CDH}^{+}$20]. See Remark 5.5.

*Proof.* First assume that $\operatorname{char}(k) \neq 2$. By Corollary 1.4 we have $n^{\mathrm{GS}}\left(V_k, \rho\right)=n\left(V_k, \rho, H \tilde{\mathbb{Z}}\right)$. If the base is $\mathbb{Z}$, then we learn from Proposition 5.4 that there exist $a, b \in \mathbb{Z}$ (independent of $k!$ ) such that

$$
n\left(V_k, \rho, \mathrm{H} \tilde{\mathbb{Z}}\right)=a+b\langle-1\rangle .
$$


In $\mathrm{GW}(\mathbb{Z}[1 / 2]) \hookrightarrow \mathrm{GW}(\mathbb{Q})$ we have the relations

$$
\langle-2\rangle=1+\langle-1\rangle-\langle 2\rangle \text { and } 2\langle 2\rangle=2
$$

(the former because $\langle a\rangle+\langle-a\rangle=\langle 1\rangle+\langle-1\rangle$ for any $a$, and see e.g. [Bac18, Lemma 42] for the latter). Hence if the base is $\mathbb{Z}[1 / 2]$, there exist $a, b \in \mathbb{Z}, c \in\{0,1\}$ (independent of the choice of field $k!$ ) such that

$$
n\left(V_k, \rho, \mathrm{H} \tilde{\mathbb{Z}}\right)=a+b\langle-1\rangle+c\langle 2\rangle .
$$


If the base is $\mathbb{Z}$, let us put $c=0$. By construction we have

$$
n_{\mathbb{R}}=\operatorname{sign} n\left(V_{\mathbb{R}}, \rho, \mathrm{H} \tilde{\mathbb{Z}}\right)=(a+c)-b
$$

and

$$
n_{\mathbb{C}}=\operatorname{rank} n\left(V_{\mathbb{C}}, \rho, \mathrm{H} \tilde{\mathbb{Z}}\right)=(a+c)+b,
$$

which determines $a+c$ and $b$, so that there only remain at most two possible values for $n\left(V_k, \rho, \mathrm{H} \tilde{\mathbb{Z}}\right)$.
Now suppose that $\operatorname{char}(k)=2$ (so that in particular the base is $\mathbb{Z}$ ). Since $\langle 1\rangle=\langle-1\rangle$ over fields of characteristic 2 , we need to show that $n^{\mathrm{GS}}\left(V_k, \rho\right)=n_{\mathbb{C}}$. We may as well assume that $k=\mathbb{F}_2$. The rank induces an isomorphism $\mathrm{GW}\left(\mathbb{F}_2\right) \cong \mathbb{Z}$ (see e.g. Corollary B.4). Considering the canonical maps

$$
\mathrm{GW}\left(\mathbb{F}_2\right) \rightarrow \mathrm{KGL}^0\left(\mathbb{F}_2\right) \leftarrow \mathrm{KGL}^0(\mathbb{Z}) \rightarrow \mathrm{KGL}^0(\mathbb{Z}[1 / 2]) \leftarrow \mathrm{GW}(\mathbb{Z}[1 / 2])
$$

in which all but the right-most one are isomorphisms, we get the string of equalities

$$
n\left(V_{\mathbb{F}_2}\right)=n\left(V_{\mathbb{F}_2}, \mathrm{KGL}\right)=n\left(V_{\mathbb{Z}}, \mathrm{KGL}\right)=n\left(V_{\mathbb{Z}[1 / 2]}, \mathrm{KGL}\right)=r k\left(n\left(V_{\mathbb{Z}[1 / 2]}, \mathrm{KO}\right)\right) .
$$


The result follows.


### (Finashin-Kharmolov) ABUNDANCE OF REAL LINES ON REAL PROJECTIVE HYPERSURFACES

**2.2. Characteristic classes.** The polar correspondence leads to a simple explicit formula for the Euler class, $e\left(\operatorname{Sym}^{2 m-1}(F)\right)$, of symmetric powers of the dual tautological bundles, $F=\widetilde{\tau}_{2, n+2}^\ast$. Namely, the polar correspondence identifies $F$ with the real 2-bundle underlying complex line bundle $L=\varkappa^\ast\left(\tau_n^\ast\right)$, so, $F \otimes \mathbb{C}=L \oplus \bar{L}$, and $\operatorname{Sym}^k(F) \otimes \mathbb{C}=\operatorname{Sym}^k(F \otimes \mathbb{C})=L^k \oplus L^{k-1} \bar{L} \cdots \oplus \bar{L}^k$, for any $k \geq 1$. The complex conjugation interchanges $L^a \bar{L}^b$ with $L^b \bar{L}^a$, thus, for any odd $k=2 m-1$, the real vector bundle $\operatorname{Sym}^{2 m-1}(F)$ is the real part of $L^{2 m-1} \oplus L^{2 m-2} \bar{L} \oplus \cdots \oplus \bar{L}^{2 m-1}$. We define an isomorphism between $L^{2 m-1} \oplus L^{2 m-2} \bar{L} \oplus \cdots \oplus L^m \bar{L}^{m-1}$ and $\operatorname{Sym}^{2 m-1}(F)$ by projecting $v \mapsto \frac{1}{2}(v+\bar{v})$. It transports the complex orientation of $L^{2 m-1} \oplus L^{2 m-2} \bar{L} \oplus \cdots \oplus L^m \bar{L}^{m-1}$ to an orientation of $\operatorname{Sym}^{2 m-1}(F)$, so that the Euler class of the latter becomes well defined and equal to the Chern class of the former one.

**2.2.1. Proposition.** <i>Under the above orientation convention,</i>

$$
e\left(S y m^{2 m-1}(F)\right)=c_m\left(L^{2 m-1} \oplus L^{2 m-2} \bar{L} \oplus \cdots \oplus L^m \bar{L}^{m-1}\right)=(2 m-1)!!c_1(L)^m
$$


**Okonek-Teleman Proof**

Using fibrewise the canonical isomorphism given by Lemma 22, and taking into account Remark 24, we obtain a bundle isomorphism

$$
S^k(\tilde{U}) \xrightarrow{\simeq} \bigoplus_{l=0}^s \tilde{\Lambda}^{\otimes(k-4 l)}
$$

which multiplies the orientation by the factor $(-1)^{\frac{s(s+1)}{2}}$. Since $c_1(\tilde{\Lambda})=e(\tilde{U})$ we can apply Proposition 19 and get

$$
e_{S^k(\tilde{U})}=(-1)^{\frac{s(s+1)}{2}} 2 \prod_{l=0}^s(k-4 l) .
$$


Note that the set $\{|k-4 l| \mid 0 \leq l \leq s\}$ coincide with the set $\{1,3, \ldots, k\}$ of odd numbers between 1 and $k$. On the other hand, the number of negative factors in the product on the right in (8) is

$$
\left\{\begin{array}{ccc}
\frac{s}{2} & \text { when } & s \text { is even } \\
\frac{s+1}{2} & \text { when } & s \text { is odd }
\end{array} .\right.
$$


But this number has the same parity as $\frac{s(s+1)}{2}$. This proves the first formula. The second formula is proved using the double cover $c: \tilde{G}_2(V) \rightarrow G_2(V)$, the functoriality of the Euler class (formula (1)), and the obvious equality $c^\ast\left(\left[G_2(V)\right]^{\prime}\right)= 2\left[\tilde{G}_2(V)\right]^{\prime}$ where $\left[G_2(V)\right]^{\prime},\left[\tilde{G}_2(V)\right]^{\prime}$ are the canonical generators of the cyclic groups $H^{2(n-2)}\left(G_2(V), \mathcal{O}_{S^k(U)}\right), H^{2(n-2)}\left(\tilde{G}_2(V), \mathbb{Z}\right)$.


