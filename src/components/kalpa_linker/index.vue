<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: '800px',
      height: $q.screen.height+'px'
    }`).column.full-width.b-30.q-pb-sm
    .row.full-width.q-pa-md
      div(
        :style=`{
          transform: 'rotate(2deg)',
        }`
        ).row.items-center.content-center
        q-btn(round flat color="white" icon="keyboard_arrow_left")
        span(
          :style=`{
            fontSize: '20px',
          }`).text-bold.text-white Make a joint
    .row.full-width.q-py-md
      div(:style=`{height: '300px',}`).row.full-width
        //- left item
        div(
          :style=`{
            transform: 'perspective(1000px) rotateY(20deg)',
            borderRadius: '10px', overflow: 'hidden',
          }`).col.full-height.b-40.shadow-4
          div(v-if="leftItem").column.fit
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width
              img(
                :src="leftItem.url" draggable="false"
                :style=`{
                  objectFit: 'cover',
                }`
                ).fit
            div(v-if="leftItem.name").row.full-width.q-pa-sm
              small.text-white {{ leftItem.name }}
        .row.full-height.items-center.content-center.justify-center
          q-icon(name="link" color="green" size="20px")
        //- right item
        div(
          :style=`{
            transform: 'perspective(1000px) rotateY(-20deg)',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).col.full-height.b-40.shadow-4
          div(v-if="rightItem").column.fit
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width
              img(
                :src="rightItem.url" draggable="false"
                :style=`{
                  objectFit: 'cover',
                }`
                ).fit
            div(v-if="rightItem.name").row.full-width.q-pa-sm
              small.text-white {{ rightItem.name }}
    .row.full-width.justify-center
      q-input(
        v-model="name"
        borderless autofocus
        type="textarea" autogrow
        spellcheck="false"
        :style=`{
          maxWidth: '600px',
        }`
        :input-style=`{
          fontSize: '30px',
          fontWeight: 'bold',
          textAlign: 'center',
          caretColor: 'rgb(76,175,80)',
          color: 'white'
        }`
        ).full-width.justify-center
    .row.full-width
      q-tabs(
        v-model="viewId"
        dense active-color="white" no-caps
        ).full-width.text-grey-6
        q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        //- minHeight: '500px',
      }`
      ).col.full-width.b-40
      //- .row.full-width.items-start.content-start
      div(v-if="viewId === 'gif'").column.fit
        .row.full-width.q-pa-sm
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="tenorSearch"
              filled dark dense color='grey-7'
              placeholder="Search GIF"
              :debounce="600"
              ).full-width
        .col.full-width.scroll
          .row.full-width.items-start.content-start
            masonry(
              :cols="6"
              :gutter="{default: 8}").full-width
              div(
                v-for="(g,gi) in gifs" :key="g.id"
                :style=`{
                  position: 'relative',
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width.q-mb-sm
                //- left/right panels
                div(
                  :style=`{
                    position: 'absolute', zIndex: 100,
                  }`
                  ).row.fit
                  div(
                    @click="gifClick(g, true)"
                    @mouseenter="gifOver = [g.id, true]"
                    @mouseleave="gifOver = null"
                    v-ripple=`{color: 'white'}`
                    :style=`{
                      position: 'relative'
                    }`
                    ).col.full-height.cursor-pointer
                    div(
                      v-if="gifOver && gifOver[0] === g.id && gifOver[1] === true"
                      :style=`{
                        background: 'rgba(0,0,0,0.3)'
                      }`
                      ).row.fit.items-center.conten-center.justify-center
                      q-icon(name="keyboard_arrow_left" size="50px" color="green")
                  div(
                    @click="gifClick(g, false)"
                    @mouseenter="gifOver = [g.id, false]"
                    @mouseleave="gifOver = null"
                    v-ripple=`{color: 'white'}`
                    :style=`{
                      position: 'relative',
                    }`
                    ).col.full-height.cursor-pointer
                    div(
                      v-if="gifOver && gifOver[0] === g.id && gifOver[1] === false"
                      :style=`{
                        background: 'rgba(0,0,0,0.3)'
                      }`
                      ).row.fit.items-center.conten-center.justify-center
                      q-icon(name="keyboard_arrow_right" size="50px" color="green")
                //- img
                img(
                  :src="g.media[0]['tinygif']['url']"
                  draggable="false"
                  :style=`{
                    pointerEvents: 'none',
                  }`
                  ).full-width
</template>

<script>
export default {
  name: 'kalpaLinker',
  data () {
    return {
      name: '',
      viewId: 'gif',
      views: [
        {id: 'node', name: 'Nodes'},
        {id: 'speher', name: 'Sphere'},
        {id: 'gif', name: 'Gif'},
      ],
      tenorSearch: '',
      tenorUrl: 'https://api.tenor.com/v1/search',
      tenorKey: 'EVS1EYKI5ZRC',
      gifs: [],
      gifOver: null,
      leftItem: null,
      rightItem: null,
    }
  },
  computed: {
    searchUrl () {
      return `${this.tenorUrl}?q=${this.tenorSearch}&key=${this.tenorKey}&limit=50`
    },
  },
  watch: {
    tenorSearch: {
      async handler (to, from) {
        console.log('tenorSearch TO', to)
        let {data} = await this.$axios.get(this.searchUrl)
        this.gifs = data.results
        console.log('data', data)
      }
    }
  },
  methods: {
    gifClick (gif, isLeft) {
      console.log('gifClick', gif)
      let itemInput = {
        type: 'EMOJI',
        url: gif.media[0].tinygif.url,
        name: gif.title
      }
      if (isLeft === true) {
        this.leftItem = itemInput
      }
      if (isLeft === false) {
        this.rightItem = itemInput
      }
    }
  },
  mounted () {
    console.log('mounted')
    this.tenorSearch = 'cool'
  }
}
</script>
