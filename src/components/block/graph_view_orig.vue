// todo
// https://bl.ocks.org/XavierGimenez/a8e8c5e9aed71ba96bd52332682c0399
// https://observablehq.com/@rymarchikbot/d3-js-force-layout-click-to-group-bundle-nodes
// https://bl.ocks.org/cjrd/6863459
// http://bl.ocks.org/GerHobbelt/3071239

<style>

#toolbox {
  position: absolute;
  bottom: 0;
  left: 0;
  margin-bottom: 0.5em;
  margin-left: 1em;
  border: 2px solid #EEEEEE;
  border-radius: 5px;
  padding: 1em;
  z-index: 5;
}

#toolbox input {
  width: 30px;
  opacity: 0.4;
}

#toolbox input:hover {
  opacity: 1;
  cursor: pointer;
}

#hidden-file-upload {
  display: none;
}

#download-input {
  margin: 0 0.5em;
}

.conceptG text {
  pointer-events: none;
}

marker {
  fill: #333;
}

g.conceptG circle {
  fill: #F6FBFF;
  stroke: #333;
  stroke-width: 2px;
}

g.conceptG:hover circle {
  fill: rgb(200, 238, 241);
}

g.selected circle {
  fill: rgb(250, 232, 255);
}

g.selected:hover circle {
  fill: rgb(250, 232, 255);
}

path.link {
  fill: none;
  stroke: #333;
  stroke-width: 6px;
  cursor: default;
}

path.link:hover {
  stroke: rgb(94, 196, 204);
}

g.connect-node circle {
  fill: #BEFFFF;
}

path.link.hidden {
  stroke-width: 0;
}

path.link.selected {
  stroke: rgb(229, 172, 247);
}
</style>
<template lang="pug">
  div(ref="graphArea" :style=`{maxWidth: width-1+'px', height: height}`).row.full-width
    //- item finder
    q-dialog(
      v-model="itemFinderShow"
      position="bottom"
      :maximized="true")
      kalpa-finder(
        :height="$q.screen.height"
        :headerTitle="$t('Pick new element for graph')",
        :pages=`{
          nodes: {views: ['all']},
          workspace: {views: ['node', 'media']},
          search: {views: ['default']},
          gif: {views: ['popular']},
        }`
        @item="addWsItem"
        @close="itemFinderShow = false"
      ).b-30
    // превьюшка выбранного элемента на графе
    q-dialog(
      v-model="previewShow"
      position="standard"
      :maximized="false"
      @hide="selectedItem = null"
      )
      div(
        @click.self="selectedItem = null"
        ).row.fit.items-center.content-center.justify-center
        item-preview(:item="selectedItem")
    div(ref="graphTooltip"
      :style=`{
      position: "absolute",
      "background-color": "white",
      "max-width": "200px",
      height: "auto",
      padding: "1px",
      "border-style": "solid",
      "border-radius": "4px",
      "border-width": "1px",
      "box-shadow": "3px 3px 10px rgba(0, 0, 0, .5)",
      "pointer-events": "none",
      opacity:0
      }`)
    div(ref="addItemMenu" :style=`{position: "absolute", opacity:0, top: 500}`)
      q-btn(:label="$t('Add from workspace')").text-grey-4
    svg(ref="graphSvg" :style=`{height: height, 'overflow-x': 'auto'}`).row.full-width
</template>

<script>
import itemPreview from 'src/pages/app/sphere_threads/item_creator/item_preview/index.vue'
import * as d3 from 'd3';
import * as assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

class LongClickDetector {
  constructor (timeout = 1000) {
    this.res = false
    this.timeout = timeout
  }

  mouseDown (func) {
    this.cancel()
    this.timerId = setTimeout(() => {
      this.res = true
      if (func) func()
    }, this.timeout)
  }

  mouseup () {
    this.cancel()
  }

  cancel () {
    this.res = false
    clearTimeout(this.timerId)
  }

  isLongClick () {
    return this.res
  }
}

export default {
  name: 'graphView',
  components: {
    itemPreview,
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    margin: {
      type: Object,
      default: () => ({ top: 30, right: 80, bottom: 5, left: 5 })
    }
  },
  data () {
    return {
      itemFinderShow: false,
      newItemLocation: [0, 0],
      selectedItem: null,
      dataset: {
        nodes: [
          {
            id: 1,
            oid: '166220274927142929',
            name: 'Черный человек',
            type: 'NODE',
            thumbUrl: 'https://cuts-yandexdev.kalpa.store/jv/9x/165900530068013071_cuts/[5210.5]_600_cut.jpg?rev=5'
          },
          {
            id: 2,
            oid: '166229872765569043',
            name: 'Андрюха на хакатоне',
            type: 'NODE',
            thumbUrl: 'https://thumbs-yandexdev.kalpa.store/we/am/166677930032807953_600_thumb.jpg?rev=15'
          },
          {
            id: 3,
            oid: '166300537782929431',
            name: 'Alan Watts',
            type: 'NODE',
            thumbUrl: 'https://cuts-yandexdev.kalpa.store/zo/y0/166299168166559750_cuts/[1101.77]_600_cut.jpg?rev=5'
          }
        ],
        joints: [
          { source: 1, target: 3, type: this.$t('ASSOCIATION') },
          { source: 2, target: 3, type: this.$t('ESSENCE') },
          { source: 1, target: 2, type: this.$t('ASSOCIATION') }

        ]
      },
      nodeRadius: 50,
      svg: null,
      defs: null,
      graphNodes: null,
      freeNodes: null,
      link: null,
      graphEdges: null,
      edgepaths: null,
      hoveredNodeData: null,
      simulation: d3.forceSimulation()
          .force('link', d3.forceLink() // This force provides links between nodes
              .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
              .distance(120)
          )
          .force('x', d3.forceX(d => this.width / 2))
          .force('y', d3.forceY(d => this.height / 2))
          // .force('center', d3.forceCenter(this.width / 2, this.height / 2))
          .force('charge', d3.forceManyBody().strength(-2500)), // This adds repulsion (if it's negative) between nodes.
      colorScale: d3.scaleOrdinal() //= d3.scaleOrdinal(d3.schemeSet2)
          .domain(['NODE', 'JOINT', 'BLOCK', 'VIDEO', 'BOOK'])
          .range(['#ff9e6d', '#86cbff', '#c2e5a0', '#fff686', '#9e79db'])
    }
  },
  computed: {
    previewShow () { return !!this.selectedItem }
  },
  methods: {
    addWsItem (item) {
      console.log('addWsItem')
      assert(item.id)
      this.itemFinderShow = false
      let d = {
        id: item.id,
        oid: item.oid,
        name: item.name,
        type: item.type,
        thumbUrl: item.thumbUrl,
        x: this.newItemLocation[0],
        y: this.newItemLocation[1]
      }
      this.dataset.nodes.push(d);
      this.updateGraph()
      this.blinkNode(d)
    },
    addEdge (d1, d2) {
      console.log('addEdge')
      let newEdge = { source: d1.id, target: d2.id, type: this.$t('ASSOCIATION') }
      // todo проверить на уникальность
      this.dataset.joints.push(newEdge);
      this.updateGraph()
    },
    blinkNode (d) {
      let selectedRect = d3.select(document.getElementById('nodeRect' + d.id))
      selectedRect
          .transition()
          .duration(200)
          .style('stroke-width', 20)
          .transition()
          .duration(200)
          .style('stroke-width', 5)
    },
    initGraph () {
      for (let n of this.dataset.nodes) {
        let cmp = (n1, n2) => {
          return n1 === n2 || n1.id === n2.id || n1 === n2.id || n2 === n1.id
        }
        if (this.dataset.joints.find(joint => cmp(joint.source, n) || cmp(joint.target, n))) n.linked = true
        else n.linked = false
      }
      if (this.svg) this.svg.remove();
      let longClickDetector = new LongClickDetector(1000)
      this.svg = d3.select(this.$refs.graphSvg)
          // .append('svg')
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .on('mouseup', (event) => {
            console.log('svg mouseup')
            longClickDetector.mouseDown()
          })
          .on('mousedown', (event) => {
            console.log('svg mousedown')
            longClickDetector.mouseDown(() => {
              console.log('svg long tap')
              this.itemFinderShow = true
              this.newItemLocation = d3.pointer(event, this.svg.node())
            })
          })
          .on('click', (event) => {
            console.log('svg click')
            longClickDetector.mouseup()
            // let addItemMenu = d3.select(this.$refs.addItemMenu)
            // if (addItemMenu.node().style.opacity > 0) {
            //   addItemMenu.style('opacity', 0);
            //   this.svg.style('opacity', 1)
            // } else if (event.target.nodeName === 'svg') {
            //   addItemMenu.style('left', (event.layerX) + 'px')
            //       .style('top', (event.layerY + 10) + 'px')
            //       .style('opacity', 1)
            //   this.svg
            //       .transition()
            //       .duration(500)
            //       .style('opacity', 0.2)
            // }
          })
          .call(d3.zoom().on('zoom', (event) => {
            this.svg.attr('transform', event.transform)
          }))
          .append('g').attr('transform', `translate(${this.margin.left},${this.margin.top})`);
      // appending little triangles, path object, as arrowhead
      // The <defs> element is used to store graphical objects that will be used at a later time
      // The <marker> element defines the graphic that is to be used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.

      this.defs = this.svg.append('defs')
      this.defs.append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '-0 -5 10 10') // the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
          .attr('refX', 30) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 13)
          .attr('markerHeight', 13)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M 0,-3 L 8 ,0 L 0,3')
          .attr('fill', '#999')
          .attr('fill-opacity', 0.8)
          .attr('stroke', 'none')
    },
    drawNodes () {
      // Initialize the nodes
      const thiz = this

      let longClickDetector = new LongClickDetector(700)
      this.defs.append('svg:marker')
          .attr('id', 'mark-end-arrow')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 7)
          .attr('markerWidth', 3.5)
          .attr('markerHeight', 3.5)
          .attr('orient', 'auto')
          .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5');
      // displayed when dragging between nodes
      let dragLine = this.svg.append('svg:path')
          .attr('class', 'link dragline hidden')
          .attr('d', 'M0,0L0,0')
          .style('marker-end', 'url(#mark-end-arrow)');

      this.graphNodes = this.svg.selectAll('.graphNodes')
          .data(this.dataset.nodes)
          .enter()
          .append('g')
          .attr('class', 'nodes')
          .on('dblclick', async (event, d) => {
            console.log('node dblclick')
            event.stopPropagation();
            longClickDetector.cancel()
            if (d.oid) {
              let xxx = await this.$rxdb.get(RxCollectionEnum.OBJ, d.oid)
              this.$log(xxx)
              this.selectedItem = xxx
            }
          })
          .on('click', (event, d) => {
            console.log('node click')
            event.stopPropagation();
            longClickDetector.cancel()
          })
          .on('mousedown', (event, d) => {
            console.log('node mousedown')
            // event.stopPropagation();
            longClickDetector.mouseDown(() => this.blinkNode(d))
          })
          .on('mouseup', (event, d) => {
            // не работает вместе с drag
            console.log('node mouseup')
            // event.stopPropagation();
            longClickDetector.mouseup()
          })
          .on('mouseover', (event, d) => {
            // console.log('node mouseover')
            this.hoveredNodeData = d
          })
          .on('mouseout', (event, d) => {
            // console.log('node mouseout')
            this.hoveredNodeData = null
          })
          .call(d3.drag() // sets the event listener for the specified typenames and returns the drag behavior.
              .on('start', function (event, d) {
                console.log('drag start')
                // d3.select(this).classed('fixed', true);
                // start - after a new pointer becomes active (on mousedown or touchstart).
                // When the drag gesture starts, the targeted node is fixed to the pointer
                // The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
                if (!event.active) thiz.simulation.alphaTarget(0.3).restart();// sets the current target alpha to the specified number in the range [0,1].
                d.fy = d.y; // fx - the node’s fixed x-position. Original is null.
                d.fx = d.x; // fy - the node’s fixed y-position. Original is null.
              })
              .on('drag', function (event, d) {
                // console.log('drag', event.x, event.y)
                // console.log('shift drag', d, d3.selection(this))
                // drag - after an active pointer moves (on mousemove or touchmove).
                // When the drag gesture starts, the targeted node is fixed to the pointer
                // eslint-disable-next-line no-constant-condition
                if (longClickDetector.isLongClick()) {
                  // console.log('shift drag1', thiz.svg, d3.pointer(event), d3.pointer(event, this), d3.pointer(event, d3.select(this)), d)
                  dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + (d.x + d3.pointer(event, this)[0]) + ',' + (d.y + d3.pointer(event, this)[1]))
                  dragLine.classed('hidden', false);
                } else {
                  longClickDetector.cancel()
                  d.fx = event.x;
                  d.fy = event.y;
                }
              })
              .on('end', (event, d) => {
                console.log('drag end')
                // end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel)
                // the targeted node is released when the gesture ends
                // if (!event.active) this.simulation.alphaTarget(0);
                // d.fx = null;
                // d.fy = null;
                if (longClickDetector.isLongClick() && this.hoveredNodeData && d !== this.hoveredNodeData) {
                  this.addEdge(d, this.hoveredNodeData)
                }
              })
          );

      let clipPath = this.defs.append('clipPath')
          .attr('id', 'clip-rect')
          .append('rect')
          .attr('x', -this.nodeRadius / 2)
          .attr('y', -this.nodeRadius / 2)
          .attr('width', this.nodeRadius)
          .attr('height', this.nodeRadius)
          .attr('rx', 10)
          .attr('ry', 10)

      let rect = this.graphNodes.append('rect')
          .attr('id', d => 'nodeRect' + d.id)
          .attr('x', -this.nodeRadius / 2)
          .attr('y', -this.nodeRadius / 2)
          .attr('width', this.nodeRadius)
          .attr('height', this.nodeRadius)
          .attr('rx', 10)
          .attr('ry', 10)
          .style('stroke', 'grey')
          .style('stroke-width', 5)
          .style('fill', 'none')
      // .style('fill', d => this.colorScale(d.type))

      let tooltip = d3.select(this.$refs.graphTooltip)
      this.graphNodes.append('image')
          .attr('id', 'node-image')
          .attr('xlink:href', d => d.thumbUrl)
          .attr('x', -this.nodeRadius / 2)
          .attr('y', -this.nodeRadius / 2)
          .attr('width', this.nodeRadius)
          .attr('height', this.nodeRadius)
          .attr('clip-path', 'url(#clip-rect)')
          .attr('preserveAspectRatio', 'xMidYMid slice')
          .on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .duration(350)
                .attr('width', 70)
                .attr('height', 70)
          })
          .on('mouseout', function (event, d) {
            d3.select(this)
                .transition()
                .duration(350)
                .attr('width', function (event, d) {
                  return 50
                })
                .attr('height', function (event, d) {
                  return 50
                })
          })
          .on('mouseover.tooltip', function (event, d) {
            // console.log(event)
            tooltip.transition()
                .duration(300)
                .style('opacity', 0.8);
            tooltip.html(d.type + '<p/>' + d.name)
                .style('left', (event.layerX) + 'px')
                .style('top', (event.layerY + 10) + 'px');
          })
          .on('mouseout.tooltip', function () {
            tooltip.transition()
                .duration(100)
                .style('opacity', 0);
          })
          .on('mousemove', function (event) {
            tooltip.style('left', (event.layerX) + 'px')
                .style('top', (event.layerY + 10) + 'px');
          })

      // node.append('title')
      //     .text(d => d.id + ': ' + d.name + ' - ' + d.type);
      //
      // node.append('text')
      //     .attr('dy', 4)
      //     .attr('dx', 0)
      //     .text(d => d.name);
      // node.append('text')
      //     .attr('dy', 25)
      //     .attr('dx', 0)
      //     .text(d => d.type);
    },
    drawEdges () {
      // Initialize the links
      this.graphEdges = this.svg.selectAll('.graphEdges')
          .data(this.dataset.joints)
          .enter()
          .append('line')
          .attr('class', 'links')
          // .attr('fill', 'black')
          .attr('marker-end', function (d, i) {
            return d.type === 'ASSOCIATION' ? 'url(#arrowhead)' : 'url(#arrowhead)' // The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.
          })

      // The <title> element provides an accessible, short-text description of any SVG container element or graphics element.
      // Text in a <title> element is not rendered as part of the graphic, but browsers usually display it as a tooltip.
      this.graphEdges.append('title').text(d => d.type);

      this.edgepaths = this.svg.selectAll('.edgepath') // make path go along with the link provide position for link labels
          .data(this.dataset.joints)
          .enter()
          .append('path')
          .attr('class', 'edgepath')
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .attr('id', function (d, i) {
            return 'edgepath' + i
          })
          .style('pointer-events', 'none');

      const edgelabels = this.svg.selectAll('.edgelabel')
          .data(this.dataset.joints)
          .enter()
          .append('text')
          .style('pointer-events', 'none')
          .attr('class', 'edgelabel')
          .attr('id', function (d, i) {
            return 'edgelabel' + i
          })
          .attr('font-size', 10)
          .attr('fill', '#aaa');

      edgelabels.append('textPath') // To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
          .attr('xlink:href', function (d, i) {
            return '#edgepath' + i
          })
          .style('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .attr('startOffset', '50%')
          .text(d => d.type);
    },
    doLayout () {
      // Listen for tick events to render the nodes as they update in your Canvas or SVG.
      let thiz = this
      this.simulation
          .nodes(this.dataset.nodes) // sets the simulation’s nodes to the specified array of objects, initializing their positions and velocities,
          .on('tick', function () {
            // use simulation.on to listen for tick events as the simulation runs.
            // After this, Each node must be an object. The following properties are assigned by the simulation:
            // index - the node’s zero-based index into nodes
            // x - the node’s current x-position
            // y - the node’s current y-position
            // vx - the node’s current x-velocity
            // vy - the node’s current y-velocity
            // This function is run at each iteration of the force algorithm, updating the nodes position (the nodes data array is directly manipulated).
            thiz.graphEdges.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            thiz.graphNodes.attr('transform', d => `translate(${d.x},${d.y})`);
            thiz.edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
          });
      // sets the array of links associated with this force, recomputes the distance and strength parameters for each link, and returns this force.
      // After this, Each link is an object with the following properties:
      // source - the link’s source node;
      // target - the link’s target node;
      // index - the zero-based index into links, assigned by this method
      this.simulation.force('link').links(this.dataset.joints);
    },
    testGraph () {
      let thiz = this
      // define graphcreator object
      let GraphCreator = function (svg, nodes, edges) {
        let thisGraph = this;
        thisGraph.idct = 0;

        thisGraph.nodes = nodes || [];
        thisGraph.edges = edges || [];

        thisGraph.state = {
          selectedNode: null,
          selectedEdge: null,
          mouseDownNode: null,
          mouseDownLink: null,
          justDragged: false,
          justScaleTransGraph: false,
          lastKeyDown: -1,
          shiftNodeDrag: false,
          selectedText: null
        };

        // define arrow markers for graph links
        let defs = svg.append('svg:defs');
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', '32')
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        // define arrow markers for leading arrow
        defs.append('svg:marker')
            .attr('id', 'mark-end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 7)
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        thisGraph.svg = svg;
        thisGraph.svgG = svg.append('g')
            .classed(thisGraph.consts.graphClass, true);
        let svgG = thisGraph.svgG;

        // displayed when dragging between nodes
        thisGraph.dragLine = svgG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0')
            .style('marker-end', 'url(#mark-end-arrow)');

        // svg nodes and edges
        thisGraph.paths = svgG.append('g').selectAll('g');
        thisGraph.circles = svgG.append('g').selectAll('g');

        thisGraph.drag = d3.drag()
            // .origin(function(d){
            //   return {x: d.x, y: d.y};
            // })
            .on('drag', function (event, d) {
              console.log('drag')
              thisGraph.state.justDragged = true;
              // eslint-disable-next-line no-useless-call,no-constant-condition
              if (thisGraph.state.shiftNodeDrag) {
                // console.log('shift drag1', d3.pointer(event), d3.pointer(event, this), d3.pointer(event, d3.select(this)), d)
                thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + (d.x + d3.pointer(event, this)[0]) + ',' + (d.y + d3.pointer(event, this)[1]));
              } else {
                d.x += event.dx;
                d.y += event.dy;
                thisGraph.updateGraph();
              }
            })
            .on('end', function () {
              // todo check if edge-mode is selected
            });

        // listen for key events
        d3.select(window).on('keydown', function (event) {
          // eslint-disable-next-line no-useless-call
          thisGraph.svgKeyDown.call(thisGraph, event);
        })
            .on('keyup', function () {
              // eslint-disable-next-line no-useless-call
              thisGraph.svgKeyUp.call(thisGraph);
            });
        // eslint-disable-next-line no-useless-call
        svg.on('mousedown', function (event, d) {
          console.log('mousedown')
          // eslint-disable-next-line no-useless-call
          thisGraph.svgMouseDown.call(thisGraph, event, d);
        });
        // eslint-disable-next-line no-useless-call
        svg.on('mouseup', function (event, d) {
          console.log('mouseup')
          // eslint-disable-next-line no-useless-call
          thisGraph.svgMouseUp.call(thisGraph, event, d);
        });
        svg.on('click', function (event, d) {
          console.log('click')
          // eslint-disable-next-line no-useless-call
          thisGraph.svgClick.call(thisGraph, event, d);
        });

        // listen for dragging
        let dragSvg = d3.zoom()
            .on('zoom', function (event) {
              if (event.sourceEvent.shiftKey) {
                // TODO  the internal d3 state is still changing
                return false;
              } else {
                // eslint-disable-next-line no-useless-call
                thisGraph.zoomed.call(thisGraph, event);
              }
              return true;
            })
            .on('start', function (event) {
              let ael = d3.select('#' + thisGraph.consts.activeEditId).node();
              if (ael) {
                ael.blur();
              }
              if (!event.sourceEvent.shiftKey) d3.select('body').style('cursor', 'move');
            })
            .on('end', function () {
              d3.select('body').style('cursor', 'auto');
            });

        svg.call(dragSvg).on('dblclick.zoom', null);

        // listen for resize
        window.onresize = function () {
          thisGraph.updateWindow(svg);
        };

        // handle download data
        d3.select('#download-input').on('click', function () {
          let saveEdges = [];
          thisGraph.edges.forEach(function (val, i) {
            saveEdges.push({ source: val.source.id, target: val.target.id });
          });
          let blob = new Blob([window.JSON.stringify({
            nodes: thisGraph.nodes,
            edges: saveEdges
          })], { type: 'text/plain;charset=utf-8' });
          // saveAs(blob, 'mydag.json');
        });

        // handle uploaded data
        d3.select('#upload-input').on('click', function () {
          document.getElementById('hidden-file-upload').click();
        });
        d3.select('#hidden-file-upload').on('change', function () {
          if (window.File && window.FileReader && window.FileList && window.Blob) {
            let uploadFile = this.files[0];
            let filereader = new window.FileReader();

            filereader.onload = function () {
              let txtRes = filereader.result;
              // TODO better error handling
              try {
                let jsonObj = JSON.parse(txtRes);
                thisGraph.deleteGraph(true);
                thisGraph.nodes = jsonObj.nodes;
                thisGraph.setIdCt(jsonObj.nodes.length + 1);
                let newEdges = jsonObj.edges;
                newEdges.forEach(function (e, i) {
                  newEdges[i] = {
                    source: thisGraph.nodes.filter(function (n) {
                      return n.id === e.source;
                    })[0],
                    target: thisGraph.nodes.filter(function (n) {
                      return n.id === e.target;
                    })[0]
                  };
                });
                thisGraph.edges = newEdges;
                thisGraph.updateGraph();
              } catch (err) {
                window.alert('Error parsing uploaded file\nerror message: ' + err.message);
              }
            };
            filereader.readAsText(uploadFile);
          } else {
            alert("Your browser won't let you save this graph -- try upgrading your browser to IE 10+ or Chrome or Firefox.");
          }
        });

        // handle delete graph
        d3.select('#delete-graph').on('click', function () {
          thisGraph.deleteGraph(false);
        });
      };

      GraphCreator.prototype.setIdCt = function (idct) {
        this.idct = idct;
      };

      GraphCreator.prototype.consts = {
        selectedClass: 'selected',
        connectClass: 'connect-node',
        circleGClass: 'conceptG',
        graphClass: 'graph',
        activeEditId: 'active-editing',
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        nodeRadius: 50
      };

      /* PROTOTYPE FUNCTIONS */

      GraphCreator.prototype.deleteGraph = function (skipPrompt) {
        let thisGraph = this;
        let doDelete = true;
        if (!skipPrompt) {
          doDelete = window.confirm('Press OK to delete this graph');
        }
        if (doDelete) {
          thisGraph.nodes = [];
          thisGraph.edges = [];
          thisGraph.updateGraph();
        }
      };

      /* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
      GraphCreator.prototype.selectElementContents = function (el) {
        let range = document.createRange();
        range.selectNodeContents(el);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };

      /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
      GraphCreator.prototype.insertTitleLinebreaks = function (gEl, title) {
        let words = title.split(/\s+/g);
        let nwords = words.length;
        let el = gEl.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-' + (nwords - 1) * 7.5);

        for (let i = 0; i < words.length; i++) {
          let tspan = el.append('tspan').text(words[i]);
          if (i > 0) {
            tspan.attr('x', 0).attr('dy', '15');
          }
        }
      };

      // remove edges associated with a node
      GraphCreator.prototype.spliceLinksForNode = function (node) {
        let thisGraph = this;
        let toSplice = thisGraph.edges.filter(function (l) {
          return (l.source === node || l.target === node);
        });
        toSplice.map(function (l) {
          thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
        });
      };

      GraphCreator.prototype.replaceSelectEdge = function (d3Path, edgeData) {
        let thisGraph = this;
        d3Path.classed(thisGraph.consts.selectedClass, true);
        if (thisGraph.state.selectedEdge) {
          thisGraph.removeSelectFromEdge();
        }
        thisGraph.state.selectedEdge = edgeData;
      };

      GraphCreator.prototype.replaceSelectNode = function (d3Node, nodeData) {
        let thisGraph = this;
        d3Node.classed(this.consts.selectedClass, true);
        if (thisGraph.state.selectedNode) {
          thisGraph.removeSelectFromNode();
        }
        thisGraph.state.selectedNode = nodeData;
      };

      GraphCreator.prototype.removeSelectFromNode = function () {
        let thisGraph = this;
        thisGraph.circles.filter(function (cd) {
          return cd.id === thisGraph.state.selectedNode.id;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedNode = null;
      };

      GraphCreator.prototype.removeSelectFromEdge = function () {
        let thisGraph = this;
        thisGraph.paths.filter(function (cd) {
          return cd === thisGraph.state.selectedEdge;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedEdge = null;
      };

      GraphCreator.prototype.pathMouseDown = function (event, d3path, d) {
        let thisGraph = this;
        let state = thisGraph.state;
        event.stopPropagation();
        state.mouseDownLink = d;

        if (state.selectedNode) {
          thisGraph.removeSelectFromNode();
        }

        let prevEdge = state.selectedEdge;
        if (!prevEdge || prevEdge !== d) {
          thisGraph.replaceSelectEdge(d3path, d);
        } else {
          thisGraph.removeSelectFromEdge();
        }
      };

      // mousedown on node
      GraphCreator.prototype.circleMouseDown = function (event, d3node, d) {
        let thisGraph = this;
        let state = thisGraph.state;
        event.stopPropagation();
        state.mouseDownNode = d;
        if (event.shiftKey) {
          state.shiftNodeDrag = event.shiftKey;
          // reposition dragged directed edge
          thisGraph.dragLine.classed('hidden', false)
              .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
        }
      };

      /* place editable text on node in place of svg text */
      GraphCreator.prototype.changeTextOfNode = function (event, d3node, d) {
        let thisGraph = this;
        let consts = thisGraph.consts;
        let htmlEl = d3node.node();
        d3node.selectAll('text').remove();
        let nodeBCR = htmlEl.getBoundingClientRect();
        let curScale = nodeBCR.width / consts.nodeRadius;
        let placePad = 5 * curScale;
        let useHW = curScale > 1 ? nodeBCR.width * 0.71 : consts.nodeRadius * 1.42;
        // replace with editableconent text
        let d3txt = thisGraph.svg.selectAll('foreignObject')
            .data([d])
            .enter()
            .append('foreignObject')
            .attr('x', nodeBCR.left + placePad)
            .attr('y', nodeBCR.top + placePad)
            .attr('height', 2 * useHW)
            .attr('width', useHW)
            .append('xhtml:p')
            .attr('id', consts.activeEditId)
            .attr('contentEditable', 'true')
            .text(d.title)
            .on('mousedown', function (event, d) {
              event.stopPropagation();
            })
            .on('keydown', function (event, d) {
              event.stopPropagation();
              if (event.keyCode === consts.ENTER_KEY && !event.shiftKey) {
                this.blur();
              }
            })
            .on('blur', function (event, d) {
              d.title = this.textContent;
              thisGraph.insertTitleLinebreaks(d3node, d.title);
              d3.select(this.parentElement).remove();
            });
        return d3txt;
      };

      // mouseup on nodes
      GraphCreator.prototype.circleMouseUp = function (event, d3node, d) {
        let thisGraph = this;
        let state = thisGraph.state;
        let consts = thisGraph.consts;
        // reset the states
        state.shiftNodeDrag = false;
        d3node.classed(consts.connectClass, false);

        let mouseDownNode = state.mouseDownNode;

        if (!mouseDownNode) return;

        thisGraph.dragLine.classed('hidden', true);

        if (mouseDownNode !== d) {
          // we're in a different node: create new edge for mousedown edge and add to graph
          let newEdge = { source: mouseDownNode, target: d };
          let filtRes = thisGraph.paths.filter(function (d) {
            if (d.source === newEdge.target && d.target === newEdge.source) {
              thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
            }
            return d.source === newEdge.source && d.target === newEdge.target;
          });
          if (!filtRes[0].length) {
            thisGraph.edges.push(newEdge);
            thisGraph.updateGraph();
          }
        } else {
          // we're in the same node
          if (state.justDragged) {
            // dragged, not clicked
            state.justDragged = false;
          } else {
            // clicked, not dragged
            if (event.shiftKey) {
              // shift-clicked node: edit text content
              let d3txt = thisGraph.changeTextOfNode(event, d3node, d);
              let txtNode = d3txt.node();
              thisGraph.selectElementContents(txtNode);
              txtNode.focus();
            } else {
              if (state.selectedEdge) {
                thisGraph.removeSelectFromEdge();
              }
              let prevNode = state.selectedNode;

              if (!prevNode || prevNode.id !== d.id) {
                thisGraph.replaceSelectNode(d3node, d);
              } else {
                thisGraph.removeSelectFromNode();
              }
            }
          }
        }
        state.mouseDownNode = null;
      }; // end of circles mouseup

      // mousedown on main svg
      GraphCreator.prototype.svgMouseDown = function (event, d) {
        this.state.graphMouseDown = true;
      };

      // mouseup on main svg
      GraphCreator.prototype.svgMouseUp = function (event, d) {
        console.log('asdasdasd')
        let thisGraph = this;
        let state = thisGraph.state;
        if (state.justScaleTransGraph) {
          // dragged not clicked
          state.justScaleTransGraph = false;
        } else if (state.graphMouseDown && event.shiftKey) {
          // clicked not dragged from svg
          // let xycoords = d3.mouse(thisGraph.svgG.node());
          console.log('asdasdasd')
          let xycoords = d3.pointer(event, thisGraph.svgG.node())
          let d = { id: thisGraph.idct++, title: 'new concept', x: xycoords[0], y: xycoords[1] };
          thisGraph.nodes.push(d);
          thisGraph.updateGraph();
          // make title of text immediently editable
          let d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function (dval) {
            return dval.id === d.id;
          }), d);
          let txtNode = d3txt.node();
          thisGraph.selectElementContents(txtNode);
          txtNode.focus();
        } else if (state.shiftNodeDrag) {
          // dragged from node
          state.shiftNodeDrag = false;
          thisGraph.dragLine.classed('hidden', true);
        }
        state.graphMouseDown = false;
      };

      GraphCreator.prototype.svgClick = function (event, d) {
        let thisGraph = this;
        if (event.shiftKey) {
          // clicked not dragged from svg
          // let xycoords = d3.mouse(thisGraph.svgG.node());
          console.log('asdasdasd')
          let xycoords = d3.pointer(event, thisGraph.svgG.node())
          let d = { id: thisGraph.idct++, title: 'new concept', x: xycoords[0], y: xycoords[1] };
          thisGraph.nodes.push(d);
          thisGraph.updateGraph();
          // make title of text immediently editable
          let d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function (dval) {
            return dval.id === d.id;
          }), d);
          let txtNode = d3txt.node();
          thisGraph.selectElementContents(txtNode);
          txtNode.focus();
        }
      };

      // keydown on main svg
      GraphCreator.prototype.svgKeyDown = function (event) {
        let thisGraph = this;
        let state = thisGraph.state;
        let consts = thisGraph.consts;
        // make sure repeated key presses don't register for each keydown
        if (state.lastKeyDown !== -1) return;

        state.lastKeyDown = event.keyCode;
        let selectedNode = state.selectedNode;
        let selectedEdge = state.selectedEdge;

        switch (event.keyCode) {
          case consts.BACKSPACE_KEY:
          case consts.DELETE_KEY:
            event.preventDefault();
            if (selectedNode) {
              thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
              thisGraph.spliceLinksForNode(selectedNode);
              state.selectedNode = null;
              thisGraph.updateGraph();
            } else if (selectedEdge) {
              thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
              state.selectedEdge = null;
              thisGraph.updateGraph();
            }
            break;
        }
      };

      GraphCreator.prototype.svgKeyUp = function () {
        this.state.lastKeyDown = -1;
      };

      // call to propagate changes to graph
      GraphCreator.prototype.updateGraph = function () {
        let thisGraph = this;
        let consts = thisGraph.consts;
        let state = thisGraph.state;

        thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function (d) {
          return String(d.source.id) + '+' + String(d.target.id);
        });
        let paths = thisGraph.paths;
        // update existing paths
        paths.style('marker-end', 'url(#end-arrow)')
            .classed(consts.selectedClass, function (d) {
              return d === state.selectedEdge;
            })
            .attr('d', function (d) {
              return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y;
            });

        // add new paths
        paths.enter()
            .append('path')
            .style('marker-end', 'url(#end-arrow)')
            .classed('link', true)
            .attr('d', function (d) {
              return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y;
            })
            .on('mousedown', function (event, d) {
                  // eslint-disable-next-line no-useless-call
                  thisGraph.pathMouseDown.call(event, thisGraph, d3.select(this), d);
                }
            )
            .on('mouseup', function (event, d) {
              state.mouseDownLink = null;
            });

        // remove old links
        paths.exit().remove();

        // update existing nodes
        thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function (d) {
          return d.id;
        });
        thisGraph.circles.attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });

        // add new nodes
        let newGs = thisGraph.circles.enter()
            .append('g');

        newGs.classed(consts.circleGClass, true)
            .attr('transform', function (d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            })
            .on('mouseover', function (event, d) {
              if (state.shiftNodeDrag) {
                d3.select(this).classed(consts.connectClass, true);
              }
            })
            .on('mouseout', function (event, d) {
              d3.select(this).classed(consts.connectClass, false);
            })
            .on('mousedown', function (event, d) {
              // eslint-disable-next-line no-useless-call
              thisGraph.circleMouseDown.call(thisGraph, event, d3.select(this), d);
            })
            .on('mouseup', function (event, d) {
              // eslint-disable-next-line no-useless-call
              thisGraph.circleMouseUp.call(thisGraph, event, d3.select(this), d);
            })
            .call(thisGraph.drag);

        newGs.append('circle')
            .attr('r', String(consts.nodeRadius));

        newGs.each(function (d) {
          thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
        });

        // remove old nodes
        thisGraph.circles.exit().remove();
      };

      GraphCreator.prototype.zoomed = function (event) {
        this.state.justScaleTransGraph = true;
        d3.select('.' + this.consts.graphClass)
            .attr('transform', event.transform)
      };

      GraphCreator.prototype.updateWindow = function (svg) {
        let docEl = document.documentElement;
        let bodyEl = document.getElementsByTagName('body')[0];
        let x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
        let y = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
        svg.attr('width', x).attr('height', y);
      };

      /** ** MAIN ****/

      // warn the user when leaving
      window.onbeforeunload = function () {
        return 'Make sure to save your graph locally before leaving :-)';
      };

      let docEl = document.documentElement;
      let bodyEl = document.getElementsByTagName('body')[0];

      let width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
      let height = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;

      let xLoc = width / 2 - 25;
      let yLoc = 100;

      // initial node data
      let nodes = [{ title: 'new concept', id: 0, x: xLoc, y: yLoc },
        { title: 'new concept', id: 1, x: xLoc, y: yLoc + 200 }];
      let edges = [{ source: nodes[1], target: nodes[0] }];

      let svg = d3.select(this.$refs.graphSvg)
          // .append('svg')
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
      // .call(d3.zoom().on('zoom', (event) => {
      //   this.svg.attr('transform', event.transform)
      // }))
      // .append('g').attr('transform', `translate(${this.margin.left},${this.margin.top})`);

      let graph = new GraphCreator(svg, nodes, edges);
      graph.setIdCt(2);
      graph.updateGraph();
    },
    updateGraph () {
      this.initGraph()
      this.drawEdges()
      this.drawNodes()
      this.doLayout()
      // this.testGraph()
    }
  },
  mounted () {
    this.updateGraph()
  }
}
</script>
