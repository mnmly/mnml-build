var chai = require('chai');
var should = chai.should();

module.exports = Home;

function Home(){
  console.log('Home');
}

should.exist(Home);

new Home();
