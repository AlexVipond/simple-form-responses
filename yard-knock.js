const fs = require('fs');

function yardSignKnockDoors(responses) {
  responses = responses.map(response => response.data)
    .filter(response => !response.unsubscribe_me && (response.lawn === "sign" || response.knock === "doors"));

  let today = new Date();
  let date = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate();

  fs.writeFile('./outputs/' + date + '-yard-signs-knock-doors.json', JSON.stringify(responses, null, 2), (err) => {
    if(err) throw err;
    console.log(responses.length + ' responses written');
  });
}

let responses = JSON.parse(
  fs.readFileSync('./response-downloads/2018-07-18-contact.json', 'utf8')
);

yardSignKnockDoors(responses);
