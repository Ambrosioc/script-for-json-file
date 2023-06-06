const fs = require("fs");
const JSONStream = require("JSONStream");
const es = require("event-stream");

const getStream = () => {
	const jsonData = fs.createReadStream("data.json", {
		encoding: "utf8",
	});
	const parser = JSONStream.parse("*");
	const stream = jsonData.pipe(parser);
	return stream;
};

let i = 0;
const stack = [];
getStream()
	.pipe(
		es.mapSync((data) => {
			console.log(data.value.name);
			if (!!data?.value?.name && !!data?.key && !data.value.deletedAt) {
				if (i < 1) {
					const childrendIds = Object.keys(data.value.children);
					const serviceId = childrendIds.reduce((acc, childId, key) => {
						const child = data.value.children[childId];
						if (child.name === "service") {
							return childId;
						}
						return acc;
					}, {});
					stack.push({
						id: data.key,
						catégory: data.value.name,
						serviceId,
					});
					i++;
				}
			}
		})
	)
	.on("end", () => {
		console.log(stack);

		fs.writeFile("newData.json", JSON.stringify(stack), "utf-8", (err) => {
			if (err) throw err;
			console.log("The file has been saved!");
		});
	})
	.on("error", (err) => {
		console.log(err);
	});
