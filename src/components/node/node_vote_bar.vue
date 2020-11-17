<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '36px',
  }`
  ).row.full-width.items-center.content-center
  //- svg(width="400" height="22" viewBox="0 0 400 22" fill="none" xmlns="http://www.w3.org/2000/svg")
  //-   path(d=`
  //-     M165.989 9H2C0.895431 9 0 9.89543 0 11C0 12.1046 0.895435 13 2 13H165.989C171.909 13
  //-     177.742 14.4259 182.995 17.1572C193.654 22.7001 206.346 22.7001 217.005 17.1572C222.258
  //-     14.4259 228.091 13 234.011 13H398C399.105 13 400 12.1046 400 11C400 9.89543 399.105 9 398
  //-     9H234.011C228.091 9 222.258 7.57406 217.005 4.84282C206.346 -0.700084 193.654 -0.700084
  //-     182.995 4.84282C177.742 7.57406 171.909 9 165.989 9Z` fill="black")
  //- svg(width="400px" height="100px" xmlns="http://www.w3.org/2000/svg").bg
    path(d="m 0 50, h 100, v -50, h100, v50, h100, v50, h-100, v-10, h-100, v-10, h-100 z" stroke="red" fill="black")
  div(
    :style=`{
      position: 'relative',
      height: '5px',
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgb(2,0,36)',
      background: 'linear-gradient(90deg, rgba(255,26,5,1) 0%, rgba(255,221,2,0.7) 25%, rgba(75,172,79,0.7) 50%, rgba(44,85,179,0.7) 75%, rgba(113,49,164,1) 100%)'
    }`).row.full-width
</template>

<script>
export default {
  name: 'nodeVoteBar',
  data () {
    return {
    }
  }
}
</script>
