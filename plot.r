c=2

eq0 = function(x) { (x/3)*(1/4)*(c**(x-3)) }
eq1 = function(x) { (x/3)*(2/4)*(c**(x-3)) }
eq2 = function(x) { (x/3)*(3/4)*(c**(x-3)) }
eq3 = function(x) { (x/3)*(4/4)*(c**(x-3)) }

dev.new(width=10, height=8)
curve(eq0, xlim=c(0, 3), ylim=c(0, 1), xaxt = 'n', yaxt = 'n', ylab="Mérito e Conhecimento", xlab="Conhecimento")
curve(eq1, xlim=c(0, 3), ylim=c(0, 1), xaxt = 'n', yaxt = 'n', add=TRUE)
curve(eq2, xlim=c(0, 3), ylim=c(0, 1), xaxt = 'n', yaxt = 'n', add=TRUE)
curve(eq3, xlim=c(0, 3), ylim=c(0, 1), xaxt = 'n', yaxt = 'n', add=TRUE)
axis(side=2, at=seq(0, 1, 0.2))
axis(side=1, at=seq(0, 3, 1))

points(c(0:3), c(eq0(0),eq0(1),eq0(2),eq0(3)))
points(c(0:3), c(eq1(0),eq1(1),eq1(2),eq1(3)))
points(c(0:3), c(eq2(0),eq2(1),eq2(2),eq2(3)))
points(c(0:3), c(eq3(0),eq3(1),eq3(2),eq3(3)))

title("Níveis de conhecimento e sua junção com mérito por nível de valorização")
text(locator(1), "f_3")
text(locator(1), "f_2")
text(locator(1), "f_1")
text(locator(1), "f_0")
