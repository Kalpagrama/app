<template lang="pug">
div(
  :style=`{
    position: 'relative',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width
  div(
    v-if="isOpened"
    :style=`{
      //- background: 'rgb(38,38,38)',
      //- borderRadius: '10px',
    }`
    ).row.full-width.justify-center.q-pt-sm
    q-icon(name="blur_on" color="white" size="100px")
  div(:style=`{height: '60px', textAlign: 'center'}`).row.full-width.items-center.content-center.justify-center
    span(v-if="isOpened").text-white.text-bold {{ sphere.name }}
    q-icon(v-else name="blur_on" color="white" size="24px")
</template>

<script>
export default {
  name: 'fromSphere',
  props: ['sphere', 'isOpened'],
  data () {
    return {
    }
  }
}
</script>
