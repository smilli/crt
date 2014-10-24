var Crt = function(numEquations) {
  this.equations = {};
  this.primes = [];
  this._generateProblem(numEquations);
  this.primesProd = 1;
  for (var i = 0; i < this.primes.length; i++) {
    this.primesProd *= this.primes[i];
  }
}


// Using these b/c assuming no student wants to do CRT on large moduli.
// Also I realize these are not primes.  Should be renamed to moduli.
// I'm lazy.
Crt.prototype.PRIMES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


Crt.prototype._generateProblem = function(numEquations) {
  var primesIndex, xEquivTo, prime;
  var usedPrimes = {}
  var usedPrimesProd = 1;
  for (var i = 0; i < numEquations; i++) {
    primesIndex = Math.floor(Math.random() * this.PRIMES.length);
    while (primesIndex in usedPrimes ||
        this._gcd(this.PRIMES[primesIndex], usedPrimesProd) !== 1) {
      primesIndex = Math.floor(Math.random() * this.PRIMES.length);
    }
    usedPrimes[primesIndex] = true;
    prime = this.PRIMES[primesIndex];
    usedPrimesProd *= prime;
    this.primes.push(prime);
    xEquivTo = Math.floor(Math.random() * prime);
    this.equations[prime] = xEquivTo;
  }
}


Crt.prototype._gcd = function(a, b) {
  if (b === 0) {
    return a;
  }
  return this._gcd(b, a % b);
}


/**
 * Finds the multiplicitive inverse of a mod m.
 * @returns {Number} - the multiplicative inverse of a mod m
 */
Crt.prototype._mulInverse = function(a, m) {
  egcd = this._egcd(a, m);
  var d = egcd[0],
      x = egcd[1],
      y = egcd[2];
  if (d !== 1) {
    throw new Error('Cannot calculate multiplicative inverse of two numbers' +
        ' that are not coprime: (' + a + ', ' + m + ')');
  }
  if (x < 0) {
    x += m;
  }
  return x;
}


/**
 * Calculates the egcd of two numbers a & b.
 * @eturns {(Number, Number, Number)} - (gcd, x, y) such that gcd = a*x + b*y
 */
Crt.prototype._egcd = function(a, b) {
  if (b === 0) {
    return [a, 1, 1];
  }
  egcd = this._egcd(b, a % b);
  var d = egcd[0],
      x = egcd[1],
      y = egcd[2];
  return [d, y, x - (Math.floor(a/b)) * y];
}


Crt.prototype._createSolutionStrTerm = function(prime, mulInverse) {
    str = this.equations[prime] + '\\cdot (';
    for (var j = 0; j < this.primes.length; j++) {
      if (this.primes[j] === prime) {
        continue;
      }
      str += this.primes[j]
      if (!(j === this.primes.length - 1 ||
          j === this.primes.length - 2 && this.primes[j+1] === prime)) {
        str += '\\cdot'
      }
    }
    str += ') \\cdot ' + mulInverse;
    return str;
}


/**
 * Solves problem
 * @returns {[string, Number]) - the string expression of the solution and the
 *  evaluated answer
 */
Crt.prototype.solveProblem = function() {
  var solutionStr = '';
  var answer = 0;
  var prime, productOfOtherPrimes, mulInverse;
  for (var i = 0; i < this.primes.length; i++) {
    prime = this.primes[i];
    productOfOtherPrimes = this.primesProd / prime;
    mulInverse = this._mulInverse(productOfOtherPrimes, prime);
    solutionStr += this._createSolutionStrTerm(prime, mulInverse);
    if (i !== this.primes.length - 1) {
      solutionStr += '+';
    }
    answer += this.equations[prime] * productOfOtherPrimes * mulInverse;
  }
  answer = answer % this.primesProd;
  solutionStr += '\\equiv ' + answer + ' \\pmod{' + this.primesProd + '}';
  return [solutionStr, answer]
}


angular.module('crtApp', [])
  .controller('ProblemController', ['$scope', function($scope) {
    $scope.generateProblem = function() {
      var prob = new Crt(3);
      $scope.equations = prob.equations;
      $scope.primesProd = prob.primesProd;
      var solvedProblem = prob.solveProblem();
      $scope.solution = solvedProblem[0];
      $scope.showSoln = false;
      $scope.answer = solvedProblem[1];
      setTimeout(function() {
        var math = MathJax.Hub.getAllJax("problem")
        var source;
        for (var i = 0; i < math.length; i++) {
          source = math[i].SourceElement()
          source.parentNode.removeChild(source);
          math[i].Remove();
        }
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
      }, 100);
      $scope.userAnswer = null;
      $scope.feedback = null;
      $scope.correctAnswer = null;
    }
    $scope.generateProblem();

    $scope.validateAnswer = function() {
      $scope.userAnswer = parseInt($scope.userAnswer, 10);
      $scope.correctAnswer = $scope.userAnswer === $scope.answer;
      if ($scope.userAnswer && $scope.correctAnswer) {
        $scope.feedback = 'Correct!';
        $scope.showSoln = true;
      } else {
        $scope.feedback = 'Incorrect :(  Try again?';
      }
    };
  }]);
