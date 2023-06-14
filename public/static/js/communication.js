const newHorseName = (name) => {
  // console.log(name, typeof name)
  fetch("/horse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name }),
  })
    // .then((response) => {
    //   return response.json()
    // })
    // .then((Rs) => {
    //   console.log("nice",Rs);
    // });
};
