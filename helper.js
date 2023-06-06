const fs = require("fs");
const JSONStream = require("JSONStream");
const es = require("event-stream");

const getStream = function () {
	const jsonData = "data.json",
		stream = fs.createReadStream(jsonData, { encoding: "utf8" }),
		parser = JSONStream.parse("$*");
	return stream.pipe(parser);
};

let i = 0;
const stack = [];
getStream()
	.pipe(
		es.mapSync(function (data) {
			if (!!data?.value?.name && !!data?.key && !data.value.deletedAt) {
				if (i < 1) {
					const childrenIds = Object.keys(data.value.children); // array childrenId
					const prestations = childrenIds.reduce((acc, childId, key) => {
						const child = data.value.children[childId];
						console.log("child :", childId, child.name);

						// Si la prestation n'est pas supprimé on push la prestation
						if (!child.deletedAt) acc[childId] = child;

						return acc;
					}, {});

					stack.push({
						id: data.key,
						category: data.value.name,
						prestations,
					});
				}
				i++;
			}
		})
	)
	.on("end", function () {
		// console.log("end :", stack);

		const jsonContent = JSON.stringify(stack);
		fs.writeFile("output.json", jsonContent, "utf-8", (err) => {
			// console.log("err out :", err);
		});
	})
	.on("error", function (err) {
		// handle any errors
		console.error("Err :", err);
	});
