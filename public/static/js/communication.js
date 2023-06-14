const newHorseName = (name) => {
  console.log(name, typeof name)
  fetch("/submitHorseName", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: 1, name: name  }), //FIXME: ID should be dynamic not always "1"
  })
    // .then((response) => {
    //   return response.json()
    // })
    // .then((Rs) => {
    //   console.log("nice",Rs);
    // });
};
