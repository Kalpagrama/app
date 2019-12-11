<template lang="pug">
.column.fit.bg-primary
  q-carousel(
    v-model="slide"
    transition-prev="scale"
    transition-next="scale"
    animated
    control-color="white"
    padding
    height="100%"
    class="bg-primary text-white")
    q-carousel-slide(name="1").row.fit.justify-center.items-start
      div(style='height: 50%').row.content-center
        .row.full-width.justify-center.q-mt-sm
          k-logo(:width="100" :height="100")
        .row.full-width.justify-center.q-mt-md
          span.text-h6 KALPAGRAMMA
          .row.full-width.justify-center
            span {{$t('essence is near')}}...
      div(style=`height: 50%`).row.content-start
        .row.full-width.justify-center
          span Select language
        .row.full-width.justify-center.q-mt-md
          q-btn(color="white" @click="chosenLanguage('RUS')").q-mr-sm.text-black RUS
          q-btn(color="white" @click="chosenLanguage('ENG')").q-ml-sm.text-black ENG
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" label="Next")
    //- q-carousel-slide(name="2").row.fit.justify-center.items-center
    //-   .row.justify-center.content-center
    //-     div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
    //-       q-icon(name="person_add" size="56px")
    //-     .row.full-width.justify-center.q-mt-sm
    //-       span.text-center.text-h5 {{$t('Find and Follow Facebook Friends')}}
    //-     .row.full-width.justify-center.q-mt-sm
    //-       span.text-center.text-grey-4 {{$t('You decide who to subscribe to. We will never post to Facebook without your permission.')}}
    //-     .row.full-width.justify-center.q-mt-lg
    //-       q-btn(unelevated color="accent") {{$t('Connect Facebook')}}
    //-   .row.full-width.justify-end.self-end
    //-     q-btn(flat color="accent" @click="nextSlide()") {{$t('Skip')}}
    //- q-carousel-slide(name="3").row.justify-center.items-center
    //-   .row.justify-center.content-center
    //-     div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
    //-       q-icon(name="add_a_photo" size="56px")
    //-     .row.full-width.justify-center.q-mt-sm
    //-       span.text-center.text-h5 {{$t('Add a profile photo')}}
    //-     .row.full-width.justify-center.q-mt-sm
    //-       span.text-center.text-grey-4 {{$t('Add a profile photo that friends could recognize you.')}}
    //-     .row.full-width.justify-center.q-mt-lg
    //-       q-btn(unelevated color="accent") {{$t('Add a photo')}}
    //-   .row.full-width.justify-end.self-end
    //-     q-btn(flat color="accent" @click="nextSlide()") {{$t('Skip')}}
    q-carousel-slide(name="2").row.justify-center.content-start
      div(style=`height: 20%`).row
        .row.full-width.justify-start
          span(style='width: 160px').text-h6 {{$t('Welcome to the')}} Kalpagramma
          .col
        .row.full-width.justify-start
          span {{$t('Choose categories witch you interested in.')}}
      div(style=`height: 70%`).row.full-width.justify-center.scroll
        //- span {{categories}}
        div(
          v-for="(c, ci) in categories" :key="ci" @click="categoriesToAdd.includes(c.type) ? catDeleteClick(c, ci) : catAddClick(c, ci)"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
          //- div(:style=`{height: '40px', width: '40px'}`).row.items-center.justify-center
            //- subClick(s, si)
            img(:src="c.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
          .col.full-height.q-ml-sm
            .row.fit.items-center
              span.text-black.text-h6 {{ c.name }}
              //- sapn.text-black {{c.type}}
              //- small {{ s }}
          div(:style=`{width: '60px', height: '60px', borderRadius: '50%'}`).row.items-center.justify-center
            q-icon(name="done" size="25px" :color="categoriesToAdd.includes(c.type) ? 'black' : 'white'")
      //- span {{categoriesToAdd}}
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" label="Next")
</template>

<script>
export default {
  name: 'kTutorialDialog',
  data () {
    return {
      cat: null,
      chosen: null,
      slide: '1',
      next: '',
      lorem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit',
      lang: '',
      categoriesToAdd: []
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories
    },
  },
  watch: {
    value: {
      handler (to, from) {
        this.$logD('value CHNAGED', to)
        if (to) {
          this.show()
        } else {
          this.hide()
        }
      }
    }
  },
  methods: {
    catDeleteClick (c, ci) {
      this.$logD('catDeleteClick', c)
      this.follow = !this.follow
      this.catIndex = ci
      this.categoriesToAdd = this.categoriesToAdd.filter((cat) => cat !== c.type)
    },
    catAddClick (c, ci) {
      this.$logD('catAddClick', c, ci)
      this.catIndex = ci
      let item = this.categories[this.catIndex].type
      this.$log('item', item)
      this.categoriesToAdd.push(item)
    },
    async catAdd() {
      try {
        this.$logD('catAdd start')
        let res = await this.$store.dispatch('user/setFavouriteCategories', this.categoriesToAdd)
        this.$logD('res', res)
        this.$logD('catAdd done', this.categoriesToAdd)
      } catch (error) {
        this.$logD('catAdd error', error)
      }
    },
    async chosenLanguage (n) {
      this.lang = n
      try {
        this.$log('changeLanguage start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.lang',
          value: this.lang
        })
        this.$log('changeLanguage done', res)
        this.$q.notify({message: 'Changed Language', color: 'green', textColor: 'white'})
        this.nextSlide()
      } catch (e) {
        this.$log('changeLanguage ERROR', n)
        this.$q.notify({message: 'Cant change Language', color: 'red', textColor: 'white'})
      }
      this.$log(this.lang)
    },
    chosenContent () {
      this.chosen = !this.chosen
    },
    prevSlide () {
      if (this.slide === '4') this.prev = '3'
      if (this.slide === '3') this.prev = '2'
      if (this.slide === '2') this.prev = '1'
      if (this.slide === '1') this.prev = '1'
      this.slide = this.prev
    },
    nextSlide () {
      if (this.slide === '1') this.next = '2'
      if (this.slide === '2') this.next = '3'
      this.slide = this.next
      if (this.next === '3') this.$emit('hide')
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
    this.categoriesToAdd.map((cat) => {
      this.catAdd({oid: cat})
    })
  }
}
</script>
