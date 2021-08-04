// todo
// https://bl.ocks.org/XavierGimenez/a8e8c5e9aed71ba96bd52332682c0399
// https://observablehq.com/@rymarchikbot/d3-js-force-layout-click-to-group-bundle-nodes
// https://bl.ocks.org/cjrd/6863459
// http://bl.ocks.org/GerHobbelt/3071239
// https://github.com/d3/d3/wiki/Gallery
// https://habr.com/ru/post/302968/
// import {selectAll} from "d3-selection";

// отображает граф.
// @add - добавить новый элемент
// @preview - показать превью узла

<template lang="pug">
  div(ref="graphArea").row.full-width
    //- item finder
    q-dialog(
      v-model="itemFinderShow"
      position="standard"
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
        @item="addNode"
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
    q-dialog(
      v-model="jointCreatorShow"
      position="standard"
      :maximized="false"
      )
      joint-creator().br
    div(ref="graphTooltip"
      :style=`{
      zIndex: itemFinderShow || previewShow || jointCreatorShow ? 10 : 10001,
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
    //div(ref="addItemMenu" :style=`{position: "absolute", opacity:1, top: 500}`)
      q-btn(:label="$t('reload')" @click="updateGraph").text-grey-4
    svg(ref="graphSvg" :style=`{height: height, zIndex: itemFinderShow || previewShow || jointCreatorShow ? 10 : 10000}`).row.full-width
</template>

<script>
import itemPreview from 'src/components/kalpa_item/item_preview'
import jointCreator from './joint_creator/index.vue'
import * as d3 from 'd3';
import * as assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'graphView',
  components: {
    itemPreview,
    jointCreator
  },
  props: {
    graph: { type: Object, required: true },
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  data () {
    return {
      itemFinderShow: false,
      jointCreatorShow: true,
      newItemLocation: [0, 0],
      selectedItem: null,
      nodeRadius: 50,
      svg: null,
      defs: null,
      graphNodes: null,
      freeNodes: null,
      link: null,
      graphEdges: null,
      edgepaths: null,
      dragLine: null,
      clipPath: null
    }
  },
  computed: {
    previewShow () {
      return !!this.selectedItem
    }
  },
  watch: {
    width: {
      handler (to, from) {
        console.log('!!!!!!!!!!!!!!!!!!width:', to)
      }
    }
  },
  methods: {
    nodeIsEqual (n1, n2) {
      // console.log(n1, n2)
      return n1 === n2 || n1.id === n2.id || n1 === n2.id || n2 === n1.id
    },
    jointIsEqual (j1, j2) {
      console.log(j1, j2)
      return (this.nodeIsEqual(j1.source, j2.source) && this.nodeIsEqual(j1.target, j2.target)) || (this.nodeIsEqual(j1.source, j2.target) && this.nodeIsEqual(j1.target, j2.source))
    },
    addNode (item) {
      console.log('addNode')
      assert(item.id)
      this.itemFinderShow = false
      if (this.graph.nodes.find(n => n.id === item.id)) {
        this.$notify('error', this.$t('same item found'))
        return
      }
      let d = {
        id: item.id,
        oid: item.oid,
        name: item.name,
        type: item.type,
        thumbUrl: item.thumbUrl,
        x: this.newItemLocation[0],
        y: this.newItemLocation[1]
      }
      this.graph.nodes.push(d);
      this.updateGraph()
      this.blinkNode(d)
    },
    addEdge (d1, d2) {
      console.log('addEdge')
      this.jointCreatorShow = true
      let newEdge = { source: d1, target: d2, type: this.$t('ASSOCIATION') }
      if (d1.id === d2.id) {
        this.$notify('error', this.$t('loop links deprecated'))
      }
      if (this.graph.joints.find(j => this.jointIsEqual(j, newEdge))) {
        this.$notify('error', this.$t('same joint found'))
        return
      }

      this.graph.joints.push(newEdge);
      this.updateGraph()
    },
    blinkNode (d, width = 20) {
      let selectedRect = d3.select(document.getElementById('nodeRect' + d.id))
      selectedRect
          .transition()
          .duration(200)
          .style('stroke-width', width)
          .style('stroke', 'green')
          .transition()
          .duration(200)
          .style('stroke-width', 5)
          .style('stroke', 'grey')
    },
    selectNode (d, width = 20) {
      let selectedRect = d3.select(document.getElementById('nodeRect' + d.id))
      selectedRect
          .transition()
          .duration(200)
          .style('stroke-width', width)
          .style('stroke', 'green')
    },
    unselectNode (d) {
      let selectedRect = d3.select(document.getElementById('nodeRect' + d.id))
      selectedRect
          .transition()
          .duration(200)
          .style('stroke-width', 5)
          .style('stroke', 'grey')
    },
    initGraph () {
      let thiz = this
      this.width = this.$refs.graphSvg.clientWidth
      this.height = this.$refs.graphSvg.clientHeight
      for (let n of this.graph.nodes) {
        assert(n.oid || n.id, 'node should have oid or id' + JSON.stringify(n))
        n.id = n.id || n.oid
        if (this.graph.joints.find(joint => this.nodeIsEqual(joint.source, n) || this.nodeIsEqual(joint.target, n))) n.linked = true
        else n.linked = false
      }
      for (let j of this.graph.joints) {
        // assert(j.oid || j.id, 'joint should have oid or id' + JSON.stringify(j))
        j.id = j.id || j.oid
        j.source = j.source.id || j.source
        j.target = j.target.id || j.target
      }

      class GraphClickProcessor {
        constructor () {
          this.state = 'BLANK'
        }

        registerEvent (event, d, type = null) {
          type = type || event.type
          // console.log('registerEvent', type, event.type)
          switch (type) {
            case 'click':
              // event.stopPropagation()
              // this.onClick(d, 300)
              break
            case 'mousedown':
              this.startLongClickDetection(this.onLongClick.bind(this, event))
              break
            case 'mouseup':
              break
            case 'touchstart':
              event.stopPropagation();
              event.preventDefault();
              this.startLongClickDetection(this.onLongClick.bind(this, event))
              break
            case 'touchend':
              this.cancelLongClickDetection()
              event.stopPropagation();
              event.preventDefault();
              break
            case 'start':
              // zoom start
              this.zoomdetected = false
              this.zoomInitialTransform = event.transform
              // console.log('zoom start', event)
              break
            case 'zoom':
              // console.log('zoom', event)
              if (this.state === 'START_LONG_CLICK' && Math.abs(event.transform.x - this.zoomInitialTransform.x) + Math.abs(event.transform.y - this.zoomInitialTransform.y) < (event.sourceEvent instanceof TouchEvent ? 10 : 5)) {
                // если чуть-чуть подвигали, драг не засчитываем (возможно это LONG_CLICK)
              } else {
                this.zoomdetected = true
                this.cancelLongClickDetection()
                thiz.svg.attr('transform', event.transform)
              }
              break
            case 'end':
              // zoom end
              if (!this.zoomdetected) {
                this.cancelLongClickDetection()
              }
              break
            default :
              throw new Error('bad event:' + type)
          }
        }

        startLongClickDetection (func) {
          this.cancelLongClickDetection()
          this.state = 'START_LONG_CLICK'
          this.timerId = setTimeout(() => {
            this.state = 'LONG_CLICK'
            console.log('long click!!!!')
            thiz.$systemUtils.hapticsImpact()
            if (func) func()
            this.timerId = null
          }, 700)
        }

        cancelLongClickDetection () {
          this.state = 'BLANK'
          clearTimeout(this.timerId)
          this.timerId = null
        }

        onLongClick (event) {
          thiz.itemFinderShow = true
          thiz.newItemLocation = d3.pointer(event, thiz.svg.node())
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
        }
      }

      let graphClickProcessor = new GraphClickProcessor()

      if (this.svg) this.svg.remove();
      this.svg = d3.select(this.$refs.graphSvg)
          // .append('svg')
          .on('click', graphClickProcessor.registerEvent.bind(graphClickProcessor))
          .on('mousedown', graphClickProcessor.registerEvent.bind(graphClickProcessor))
          .on('mouseup', graphClickProcessor.registerEvent.bind(graphClickProcessor))
          .on('touchstart', graphClickProcessor.registerEvent.bind(graphClickProcessor))
          .on('touchend', graphClickProcessor.registerEvent.bind(graphClickProcessor))
          .call(d3.zoom()
              .on('start', graphClickProcessor.registerEvent.bind(graphClickProcessor))
              .on('zoom', graphClickProcessor.registerEvent.bind(graphClickProcessor))
              .on('end', graphClickProcessor.registerEvent.bind(graphClickProcessor))
          )
          .append('g')

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
      this.defs.append('marker')
          .attr('id', 'dragline-end')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 7)
          .attr('markerWidth', 3.5)
          .attr('markerHeight', 3.5)
          .attr('orient', 'auto')
          .attr('fill', 'grey')
          .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5');
      // displayed when dragging between nodes
      this.dragLine = this.svg.append('path')
          .attr('class', 'link dragline hidden')
          .attr('d', 'M0,0L0,0')
          .attr('stroke', 'grey')
          .attr('stroke-width', '3')
          .style('marker-end', 'url(#dragline-end)');
      this.clipPath = this.defs.append('clipPath')
          .attr('id', 'clip-rect')
          .append('rect')
          .attr('x', -this.nodeRadius / 2)
          .attr('y', -this.nodeRadius / 2)
          .attr('width', this.nodeRadius)
          .attr('height', this.nodeRadius)
          .attr('rx', 10)
          .attr('ry', 10)
    },
    drawNodes () {
      // Initialize the nodes
      const thiz = this
      let tooltip = d3.select(this.$refs.graphTooltip)

      class NodeClickProcessor {
        constructor () {
          this.state = 'BLANK'
        }

        registerEvent (event, d, type = null) {
          type = type || event.type
          // console.log('registerEvent', type, event.type)
          switch (type) {
            case 'dblclick':
              event.stopPropagation();
              break
            case 'click':
              event.stopPropagation()
              this.onClick(d, 300)
              break
            case 'mousedown':
              this.startLongClickDetection(thiz.blinkNode.bind(thiz, d, 20))
              break
            case 'mouseup':
              break
            case 'mouseover':
              this.onMouseOverWithLongClick(d)
              break
            case 'mouseout':
              this.onMouseOutWithLongClick(d)
              break
            case 'touchstart':
              event.stopPropagation();
              event.preventDefault();
              this.startLongClickDetection(thiz.blinkNode.bind(thiz, d, 80))
              break
            case 'touchend':
              this.cancelLongClickDetection()
              event.stopPropagation();
              event.preventDefault();
              break
            case 'start':
              this.dragdetected = false
              // When the drag gesture starts, the targeted node is fixed to the pointer
              // The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
              if (!event.active) thiz.simulationLinked.alphaTarget(0.2).restart();// sets the current target alpha to the specified number in the range [0,1].
              break
            case 'drag':
              if (this.state === 'LONG_CLICK') {
                this.dragLine(event, d)
                if (event.sourceEvent instanceof TouchEvent) {
                  let linkedNodeData = null
                  for (let n of thiz.graph.nodes) {
                    let x = n.x - event.x
                    let y = n.y - event.y
                    let l = Math.sqrt(x * x + y * y)
                    let r = thiz.nodeRadius;
                    if (l < r) {
                      linkedNodeData = n;
                    }
                  }
                  if (this.linkedNodeData) thiz.unselectNode(this.linkedNodeData)
                  this.linkedNodeData = linkedNodeData;
                  if (this.linkedNodeData && this.linkedNodeData !== d) thiz.selectNode(this.linkedNodeData, 60)
                  console.log('drag this.linkedNodeData', this.linkedNodeData)
                }
              } else if (this.state === 'START_LONG_CLICK' && Math.abs(d.x - event.x) + Math.abs(d.y - event.y) < (event.sourceEvent instanceof TouchEvent ? 20 : 5)) {
                // если чуть-чуть подвигали, драг не засчитываем (возможно это LONG_CLICK)
              } else {
                this.dragdetected = true
                this.cancelLongClickDetection()
                d.fx = event.x;
                d.fy = event.y;
              }
              break
            case 'end':
              this.clearLine()
              if (this.linkedNodeData && d !== this.linkedNodeData) this.createEdge(d)
              if (!this.dragdetected && event.sourceEvent instanceof TouchEvent) this.onClick(d, 500)
              break
            default :
              throw new Error('bad event:' + type)
          }
        }

        onClick (d, dblClickInterval = 300) {
          console.log('!!!click')
          if (Date.now() - this.lastClickDt < dblClickInterval) {
            // даблклик
            clearTimeout(this.timeClickId)
            this.onDblClick(d)
            this.lastClickDt = null
            return
          }
          this.lastClickDt = Date.now()
          this.timeClickId = setTimeout(() => {
            delete d.fx;
            delete d.fy;
          }, dblClickInterval + 50)
        }

        onDblClick (d) {
          if (d.oid) {
            thiz.$systemUtils.hapticsImpact()
            thiz.$rxdb.get(RxCollectionEnum.OBJ, d.oid).then(item => {
              thiz.$log(item)
              thiz.selectedItem = item
            }).catch(err => thiz.$logE(err))
          }
        }

        onMouseOverWithLongClick (d) {
          if (this.state === 'LONG_CLICK') this.linkedNodeData = d
        }

        onMouseOutWithLongClick (d) {
          this.linkedNodeData = null
        }

        dragLine (event, d) {
          // thiz.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + (d.x + d3.pointer(event, this)[0]) + ',' + (d.y + d3.pointer(event, this)[1]))
          thiz.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + (event.x) + ',' + (event.y))
          thiz.dragLine.classed('hidden', false);
        }

        clearLine () {
          thiz.dragLine.classed('hidden', true);
        }

        createEdge (d) {
          thiz.addEdge(d, this.linkedNodeData)
          this.linkedNodeData = null
          thiz.$systemUtils.hapticsImpact()
        }

        hideToolTip () {
          tooltip.transition()
              .duration(100)
              .style('opacity', 0);
        }

        startLongClickDetection (func) {
          this.cancelLongClickDetection()
          this.state = 'START_LONG_CLICK'
          this.timerId = setTimeout(() => {
            this.state = 'LONG_CLICK'
            if (func) func()
            thiz.$systemUtils.hapticsImpact()
            this.timerId = null
          }, 700)
        }

        cancelLongClickDetection () {
          this.state = 'BLANK'
          this.hideToolTip()
          clearTimeout(this.timerId)
          this.timerId = null
        }
      }

      let clickProcessor = new NodeClickProcessor()
      this.graphNodes = this.svg.selectAll('.graphNodes')
          .data(this.graph.nodes)
          .enter()
          .append('g')
          // .attr('class', 'nodes')
          .on('dblclick', clickProcessor.registerEvent.bind(clickProcessor))
          .on('click', clickProcessor.registerEvent.bind(clickProcessor))
          .on('mousedown', clickProcessor.registerEvent.bind(clickProcessor))
          .on('mouseup', clickProcessor.registerEvent.bind(clickProcessor))
          .on('touchstart', clickProcessor.registerEvent.bind(clickProcessor))
          .on('touchend', clickProcessor.registerEvent.bind(clickProcessor))
          .on('mouseover', clickProcessor.registerEvent.bind(clickProcessor))
          .on('mouseout', clickProcessor.registerEvent.bind(clickProcessor))
          .call(d3.drag() // sets the event listener for the specified typenames and returns the drag behavior.
              .on('start', clickProcessor.registerEvent.bind(clickProcessor))
              .on('drag', clickProcessor.registerEvent.bind(clickProcessor))
              .on('end', clickProcessor.registerEvent.bind(clickProcessor))
          );
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
            // console.log('image mouseover')
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

      // this.graphNodes.append('title')
      //     .text(d => d.id + ': ' + d.name + ' - ' + d.type);
      // this.graphNodes.append('text')
      //     .attr('dy', 4)
      //     .attr('dx', 0)
      //     .text(d => d.name)
      // this.graphNodes.append('text')
      //     .attr('dy', 25)
      //     .attr('dx', 0)
      //     .text(d => d.type);
    },
    drawEdges () {
      // Initialize the links
      this.graphEdges = this.svg.selectAll('.graphEdges')
          .data(this.graph.joints)
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
          .data(this.graph.joints)
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
          .data(this.graph.joints)
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
      console.log('doLayout', this.width)
      // Listen for tick events to render the nodes as they update in your Canvas or SVG.
      let thiz = this
      // this.simulationUnlinked = this.simulationUnlinked || d3.forceSimulation()
      //     .force('x', d3.forceX(d => this.width / 2))
      //     .force('y', d3.forceY(d => this.height / 2))
      //     // .force('center', d3.forceCenter().x(200).y(200))
      //     .force('charge', d3.forceManyBody().strength(-2500));
      // this.simulationUnlinked
      //     .nodes(this.graph.nodes.filter(n => !n.linked))
      //     .force('collide', d3.forceCollide().strength(0.5).radius(d => { return this.nodeRadius }).iterations(1))
      //     .on('tick', (d) => {
      //       thiz.graphNodes.filter(n => !n.linked).attr('transform', d => `translate(${d.x},${d.y})`);
      //     });

      this.simulationLinked = this.simulationLinked || d3.forceSimulation()
          .force('link', d3.forceLink() // This force provides links between nodes
              .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
              .distance(120)
          )
          .force('x', d3.forceX().strength(d => d.linked ? 0.1 : 0.5).x(d => d.linked ? this.width / 2 : this.width / 4))
          .force('y', d3.forceY().strength(d => d.linked ? 0.1 : 0.5).y(d => d.linked ? this.height / 2 : this.height / 4))
          // .force('center', d3.forceCenter(this.width / 2, this.height / 2))
          .force('charge', d3.forceManyBody().strength(d => d.linked ? -2500 : -700)) // This adds repulsion (if it's negative) between nodes.
      this.simulationLinked
          .nodes(this.graph.nodes)// sets the simulation’s nodes to the specified array of objects, initializing their positions and velocities,
          .on('tick', function () {
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
      this.simulationLinked.force('link').links(this.graph.joints)
      this.simulationLinked.alphaTarget(0.1).restart();
      // this.simulationUnlinked.alphaTarget(0.2).restart();
    },
    updateGraph () {
      this.initGraph()
      this.drawEdges()
      this.drawNodes()
      this.doLayout()
      // this.testGraph()
    },
    testGraph () {
      this.width = this.$refs.graphSvg.clientWidth
      this.height = this.$refs.graphSvg.clientHeight
      let radius = 6
      let step = radius * 2
      let theta = Math.PI * (3 - Math.sqrt(5))
      let data = Array.from({ length: 2000 }, (_, i) => {
        const radius = step * Math.sqrt(i += 0.5)
        const a = theta * i;
        return {
          x: this.width / 2 + radius * Math.cos(a),
          y: this.height / 2 + radius * Math.sin(a)
        };
      })

      const svg = d3.select(this.$refs.graphSvg)
          .attr('viewBox', [0, 0, this.width, this.height])
          .on('touchstart', function (event) {
            console.log('touchstart', event)
            event.stopPropagation()
          })
          .on('touchmove', function (event) {
            // console.log('touchmove', event)
            event.stopPropagation()
          });

      const g = svg.append('g')
          .attr('cursor', 'grab');

      g.selectAll('circle')
          .data(data)
          .join('circle')
          .attr('cx', ({ x }) => x)
          .attr('cy', ({ y }) => y)
          .attr('r', radius)
          .attr('fill', (d, i) => d3.interpolateRainbow(i / 360))
          .call(d3.drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended));

      svg.call(d3.zoom()
          .extent([[0, 0], [this.width, this.height]])
          .scaleExtent([1, 8])
          .on('zoom', zoomed));

      function dragstarted (event) {
        console.log('dragstarted', event)
        event.sourceEvent.stopPropagation();
        d3.select(this).raise();
        g.attr('cursor', 'grabbing');
      }

      function dragged (event, d) {
        console.log('dragged', event)
        event.sourceEvent.stopPropagation();
        d3.select(this).attr('cx', d.x = event.x).attr('cy', d.y = event.y);
      }

      function dragended (event) {
        console.log('dragended', event)
        event.sourceEvent.stopPropagation();
        g.attr('cursor', 'grab');
      }

      function zoomed ({ transform }) {
        g.attr('transform', transform);
      }

      return svg.node();
    }
  },
  mounted () {
    this.$log('graph=', JSON.parse(JSON.stringify(this.graph)))
    this.updateGraph()
    // this.testGraph()
  }
}
</script>
