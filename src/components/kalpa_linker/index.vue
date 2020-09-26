<style>
.wavingleft {
  animation: wavingleft-animation 1.5s steps(16, start) infinite;
  -webkit-animation: wavingleft-animation 1.5s steps(16, start) infinite;
}
@keyframes wavingleft-animation {
  0% {
    transform: perspective(1000px) rotateY(20deg);
  }
  50% {
    transform: perspective(1000px) rotateY(16deg);
  }
  100% {
    transform: perspective(1000px) rotateY(20deg);
  }
}
@-webkit-keyframes wavingleft-animation {

  0% {
    transform: perspective(1000px) rotateY(20deg);
  }
  50% {
    transform: perspective(1000px) rotateY(16deg);
  }
  100% {
    transform: perspective(1000px) rotateY(20deg);
  }
}
.wavingright {
  animation: wavingright-animation 1.5s steps(16, start) infinite;
  -webkit-animation: wavingright-animation 1.5s steps(16, start) infinite;
}
@keyframes wavingright-animation {
  0% {
    transform: perspective(1000px) rotateY(-20deg);
  }
  50% {
    transform: perspective(1000px) rotateY(-16deg);
  }
  100% {
    transform: perspective(1000px) rotateY(-20deg);
  }
}
@-webkit-keyframes wavingright-animation {

  0% {
    transform: perspective(1000px) rotateY(-20deg);
  }
  50% {
    transform: perspective(1000px) rotateY(-16deg);
  }
  100% {
    transform: perspective(1000px) rotateY(-20deg);
  }
}
</style>

<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: '800px',
      height: $q.screen.height+'px'
    }`).column.full-width.b-30.q-pb-sm
    .row.full-width.justify-between.q-pt-sm
      div(
        :style=`{
          transform: 'rotate(2deg)',
        }`
        ).row.items-center.content-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_left")
        span(
          :style=`{
            fontSize: '20px',
          }`).text-bold.text-white Make a joint
      div(
        :style=`{
          transform: 'rotate(-2deg)',
        }`
        ).row.items-center.content-center
        q-btn(round flat color="grey-6" icon="more_vert")
    .row.full-width.q-py-md
      div(:style=`{height: '400px',}`).row.full-width
        //- left item
        div(
          :style=`{
            //- transform: 'perspective(1000px) rotateY(20deg)',
            borderRadius: '10px', overflow: 'hidden',
          }`).col.full-height.wavingleft
          div(
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).column.fit
            div(:style=`{height: '40px'}`).row.full-width.items-center.content-center
              q-btn(
                v-if="leftItem"
                flat dense color="grey-6" no-caps)
                q-icon(name="keyboard_arrow_down" color="green")
                span.text-white.text-bold {{ itemTypes.find(i => i.id === leftItem.jointType).name }}
                q-menu(dark)
                  div(:style=`{width: '100px'}`).row
                    q-btn(
                      @click="leftItem.jointType = t.id"
                      v-for="(t,ti) in itemTypes" :key="t.id"
                      v-if="t.id !== leftItem.jointType"
                      flat dense no-caps color='grey-2').full-width {{ t.name }}
            div(
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).col.full-width.b-40.shadow-4
              div(v-if="leftItem").column.fit
                div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width
                  img(
                    @click="leftItem.cover = !leftItem.cover"
                    :src="leftItem.url" draggable="false"
                    :style=`{
                      objectFit: leftItem.cover ? 'cover' : 'contain',
                    }`
                    ).fit
                div(v-if="leftItem.name").row.full-width.justify-center.q-pa-sm
                  small.text-white {{ leftItem.name }}
        //- divider with link icon
        .row.full-height.items-center.content-center.justify-center
          q-icon(name="link" color="green" size="24px")
        //- right item
        div(
          :style=`{
            //- transform: 'perspective(1000px) rotateY(-20deg)',
            borderRadius: '10px', overflow: 'hidden',
          }`).col.full-height.wavingright
          div(
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).column.fit
            div(:style=`{height: '40px'}`).row.full-width.items-center.content-center.justify-end
              q-btn(
                v-if="rightItem"
                flat dense color="grey-6" no-caps)
                span.text-white.text-bold {{ itemTypes.find(i => i.id === rightItem.jointType).name }}
                q-icon(name="keyboard_arrow_down" color="green")
                q-menu(dark)
                  div(:style=`{width: '100px'}`).row
                    q-btn(
                      @click="rightItem.jointType = t.id"
                      v-for="(t,ti) in itemTypes" :key="t.id"
                      v-if="t.id !== rightItem.jointType"
                      flat dense no-caps color='grey-2').full-width {{ t.name }}
            div(
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).col.full-width.b-40.shadow-4
              div(v-if="rightItem").column.fit
                div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width
                  img(
                    @click="rightItem.cover = !rightItem.cover"
                    :src="rightItem.url" draggable="false"
                    :style=`{
                      objectFit: rightItem.cover ? 'cover' : 'contain',
                    }`
                    ).fit
                div(v-if="rightItem.name").row.full-width.justify-center.q-pa-sm
                  small.text-white {{ rightItem.name }}
    .row.full-width
      edit-name(@name="name = $event" :name="name").q-mb-md
    //- view selector
    .row.full-width
      q-tabs(
        v-model="viewId"
        dense active-color="white" no-caps
        ).full-width.text-grey-6
        q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
    //- from wrapper: nodes, gifs...
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        background: 'rgb(35,35,35)',
      }`
      ).col.full-width
      component(:is="`from-${viewId}`")
        //- NEED TO EXPOSE TINT SLOT WITH ITEM PROP WITH UNIQUE ID !
        template(v-slot:tint=`{item, itemKey}`)
          div(
            v-if="item && itemKey"
            :style=`{
              position: 'absolute', zIndex: 300,
              borderRadius: '10px', overflow: 'hidden',
            }`
            @mouseenter="itemOver = itemKey"
            @mouseleave="itemOver = null"
            ).row.fit
            div(
              v-for="(i,ii) in 2" :key="i"
              @click="itemClick(viewId, item, ii)"
              v-ripple=`{color: 'white'}`
              :style=`{
                position: 'relative'
              }`
              ).col.full-height.cursor-pointer
              div(
                v-if="itemOver === itemKey"
                :style=`{
                  background: 'rgba(0,0,0,0.2)'
                }`
                ).row.fit.items-center.conten-center.justify-center
                q-icon(
                  size="50px" color="green"
                  :name="ii === 0 ? 'keyboard_arrow_left' : 'keyboard_arrow_right'")
</template>

<script>
export default {
  name: 'kalpaLinker',
  components: {
    editName: () => import('./edit_name.vue'),
    fromNodes: () => import('./from_nodes.vue'),
    fromGifs: () => import('./from_gifs.vue'),
  },
  data () {
    return {
      name: '',
      viewId: 'gifs',
      views: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'video', name: 'Videos'},
        {id: 'image', name: 'Images'},
        {id: 'books', name: 'Books'},
        {id: 'audio', name: 'Music'},
        {id: 'speher', name: 'Spheres'},
        {id: 'bookmarks', name: 'Bookmarks'},
        {id: 'gifs', name: 'GIFs'},
      ],
      items: [],
      item: null,
      itemOver: null,
      leftItem: null,
      rightItem: null,
    }
  },
  computed: {
    itemTypes () {
      return [
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        {id: 'TRUE', name: 'Правда', pair: 'FALSE'},
        {id: 'FALSE', name: 'Ложь', pair: 'TRUE'},
        {id: 'FROM', name: 'Первое', pair: 'TO'},
        {id: 'TO', name: 'Второе', pair: 'FROM'},
      ]
    },
  },
  watch: {
    leftItem: {
      deep: true,
      handler (to, from) {
        this.$log('leftItem TO', to)
        if (to) {
          if (this.rightItem) {
            let t = this.itemTypes.find(i => i.id === to.jointType).pair
            this.$log('leftItem EFFECT rightItem with:', t)
            this.rightItem.jointType = t
          }
        }
      }
    },
    rightItem: {
      deep: true,
      handler (to, from) {
        this.$log('rightItem TO', to)
        if (to) {
          if (this.leftItem) {
            let t = this.itemTypes.find(i => i.id === to.jointType).pair
            this.$log('rightItem EFFECT leftItem with: ', t)
            this.leftItem.jointType = t
          }
        }
      }
    },
  },
  methods: {
    itemClick (type, item, itemIndex) {
      this.$log('itemClick', type, item, itemIndex)
      if (type === 'gifs') {
        this.$log('making gif')
        let itemInput = {
          type: 'EMOJI',
          url: item.media[0].tinygif.url,
          name: item.title,
          jointType: 'SOLUTION',
          cover: true
        }
        if (itemIndex === 0) {
          if (this.rightItem) itemInput.jointType = this.itemTypes.find(i => i.id === this.rightItem.jointType).pair
          this.leftItem = itemInput
        }
        if (itemIndex === 1) {
          if (this.leftItem) itemInput.jointType = this.itemTypes.find(i => i.id === this.leftItem.jointType).pair
          this.rightItem = itemInput
        }
      }
      else if (type === 'nodes') {
        this.$log('making node')
      }
      else {
        this.$q.notify({type: 'negative', position: 'top', message: 'Not supported :('})
      }
    },
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
