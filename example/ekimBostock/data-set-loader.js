function getGraphDataSets() {

	const loadMiserables = function(Graph) {
		Graph
			.cooldownTicks(200)
			.nodeLabel('id')
			.nodeAutoColorBy('group')
			.jsonUrl('miserables.json');
	};
	loadMiserables.description = "<em>Les Miserables</em> data (<a href='https://bl.ocks.org/barionleg/a90c2389b9bd95f14ef10e38c8c8c826'>co-occurence in Les Misérables</a>)";

	//

	const loadBlocks = function(Graph) {
		fetch('blocks.json').then(r => r.json()).then(data => {
			data.nodes.forEach(node => {
				node.name = `${node.user?node.user+': ':''}${node.description || node.id}`
			});

			Graph
				.cooldownTicks(300)
				.cooldownTime(20000)
				.nodeAutoColorBy('user')
				.forceEngine('ngraph')
				.graphData(data);
		});
	};
	loadBlocks.description = "<em>Blocks</em> data (<a href='https://bl.ocks.org/barionleg/b6cf4df944c1837e78401ed517b9ae6c/'>force-directed network of mentions in the bl.ocks README</a>)";

	//

	const loadD3Dependencies = function(Graph) {
		fetch('d3.csv').then(r => r.text()).then(d3.csvParse).then(data => {
			const nodes = [],
				links = [];
			data.forEach(({
				size,
				path
			}) => {
				const levels = path.split('/'),
					module = levels.length > 1 ? levels[1] : null,
					leaf = levels.pop(),
					parent = levels.join('/');

				nodes.push({
					path,
					leaf,
					module,
					size: +size || 1
				});

				if (parent) {
					links.push({
						source: parent,
						target: path
					});
				}
			});

			Graph
				.cooldownTicks(300)
				.nodeRelSize(0.5)
				.nodeId('path')
				.nodeVal('size')
				.nodeLabel('path')
				.nodeAutoColorBy('module')
				.forceEngine('ngraph')
				.graphData({
					nodes: nodes,
					links: links
				});
		});
	};
	loadD3Dependencies.description = "<em>D3 dependencies</em> data (<a href='https://bl.ocks.org/barionleg/6f7bfc8ab1ec9b5adbe4143e79abf931'>Force-Directed Tree II</a>)";

	const tunnel = function(Graph) {

		const perimeter = 12,
			length = 30;

		const getId = (col, row) => `${col},${row}`;

		let nodes = [],
			links = [];
		for (let colIdx = 0; colIdx < perimeter; colIdx++) {
			for (let rowIdx = 0; rowIdx < length; rowIdx++) {
				const id = getId(colIdx, rowIdx);
				nodes.push({
					id
				});

				// Link vertically
				if (rowIdx > 0) {
					links.push({
						source: getId(colIdx, rowIdx - 1),
						target: id
					});
				}

				// Link horizontally
				links.push({
					source: getId((colIdx || perimeter) - 1, rowIdx),
					target: id
				});
			}
		}

		Graph
			.cooldownTicks(300)
			.forceEngine('ngraph')
			.graphData({
				nodes: nodes,
				links: links
			});
	};
	tunnel.description = "fabric data for a cylindrical tunnel shape";

	//

	return [loadMiserables, loadBlocks, loadD3Dependencies, tunnel];
}
