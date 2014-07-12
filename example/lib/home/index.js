var chai = require('chai');
var should = chai.should();

module.exports = Home;

function Home(){
  console.log('Home me');
  var a = document.createElement('a');
  a.href = 'http://google.com';
  a.innerHTML = 'google';
  document.documentElement.appendChild(a);
}

should.exist(Home);

new Home();
