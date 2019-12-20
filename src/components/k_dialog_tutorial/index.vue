<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
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
    //- PROFILE
    q-carousel-slide(name="1").row.fit.justify-center.items-start
      div(style='height: 40%').row.content-center
        .row.full-width.justify-center.q-mt-sm
          k-logo(:width="100" :height="100")
        .row.full-width.justify-center.q-mt-md
          span.text-h6 KALPAGRAMMA
          .row.full-width.justify-center
            span {{$t('essence is near')}}...
      div(style=`height: 60%`).row.content-start
        .row.full-width.justify-start.q-mt-md
          span {{$t('Enter your First name'), ('Введите своt имя')}}
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mt-sm.bg-white
          input(v-model="nameFirst").full-width.kinput
        .row.full-width.justify-start.q-mt-sm
          span {{$t('Enter your Second name'), ('Введите свою фамилию')}}
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mt-sm.bg-white
          input(v-model="nameSecond").full-width.kinput
        .row.full-width.justify-center.q-mt-md
          span Select language
        .row.full-width.justify-center.q-mt-md
          q-btn(:color="rusColor" @click="lang = 'RUS'").q-mr-sm.text-black RUS
          q-btn(:color="engColor" @click="lang = 'ENG'").q-ml-sm.text-black ENG
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" v-if="allselected === true" style=`height: 40px` @click="secondSlide()" color="accent" :label="$t('Next')")
    //- PHOTO
    q-carousel-slide(name="2").row.justify-center.items-center
      k-dialog-bottom(ref="userPhotoDialog" mode="actions" :options="userPhotoDialogOptions" @action="userPhotoAction")
      input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
      div(style=`height: 40%`).row.row.full-width.justify-center.content-center
        div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
          q-icon(name="add_a_photo" size="56px")
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-h5 {{$t('Add a profile photo')}}
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-grey-4 {{$t('Add a profile photo that friends could recognize you.')}}
        .row.full-width.justify-center.q-mt-md
          q-btn(unelevated @click="changePhoto()" color="accent") {{$t('Add a photo')}}
      div(style=`height: 70%`).row.row.full-width.justify-center
        div(v-if="$store.state.user.user.profile.thumbUrl").row.full-width.justify-center.q-mt-md
          img(:src="$store.state.user.user.profile.thumbUrl" :style=`{width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden'}`).bg-grey-2
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" :label="$t('Next')")
    //- CATEGORIES
    q-carousel-slide(name="3").row.justify-center.content-start
      div(style=`height: 20%`).row
        .row.full-width.justify-start
          span(style='width: 160px').text-h6 {{$t('Welcome to the')}} Kalpagramma
          .col
        .row.full-width.justify-start
          span {{$t('Choose categories witch you interested in.')}}
      div(style=`height: 70%`).row.full-width.justify-center.scroll
        div(
          v-for="(c, ci) in categories" :key="ci" @click="categoriesToAdd.includes(c.type) ? catDeleteClick(c, ci) : catAddClick(c, ci)"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
          .col.full-height.q-ml-sm
            .row.fit.items-center
              span.text-black.text-h6 {{ c.name }}
          div(:style=`{width: '60px', height: '60px', borderRadius: '50%'}`).row.items-center.justify-center
            q-icon(name="done" size="25px" :color="categoriesToAdd.includes(c.type) ? 'black' : 'white'")
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" v-if="categoriesToAdd.length >= 1" style=`height: 40px` @click="nextSlide()" color="accent" :label="$t('Next')")
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
      lang: '',
      categoriesToAdd: [],
      nameFirst: '',
      nameSecond: ''
    }
  },
  computed: {
    rusColor () {
      if (this.lang === 'RUS') return 'accent'
      else return 'white'
    },
    engColor () {
      if (this.lang === 'ENG') return 'accent'
      else return 'white'
    },
    categories () {
      return this.$store.state.node.categories
    },
    allselected () {
      if (this.nameFirst && this.nameSecond && this.lang) return true
      else return false
    },
    userPhotoDialogOptions () {
      return {
        confirm: false,
        actions: {
          // makePhoto: {name: 'Make a photo'},
          download: {name: 'Download from device'}
        }
      }
    }
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
    async downloadPhoto (file) {
      try {
        this.$log('changePhoto start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.thumbUrl',
          value: file
        })
      } catch (e) {
        this.$log('changePhoto ERROR', e)
      }
    },
    changePhoto () {
      this.$refs.fileInput.click()
    },
    fileChanged (e) {
      this.$log(e.target.files)
      if (e.target.files.length === 1){
        this.file = e.target.files[0]
        this.downloadPhoto(this.file)
      } else throw new Error(`bad selected files len ${e.target.files.length}`)
    },
    catDeleteClick (c, ci) {
      this.$logD('catDeleteClick', c)
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
    async enterNameFirst () {
      try {
        this.$log('changeNameFirst start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.nameFirst',
          value: this.nameFirst
        })
        this.$log('changeNameFirst done', res)
      } catch (e) {
        this.$log('changeNameFirst ERROR', e)
        this.$q.notify({message: 'Cant change First name', color: 'red', textColor: 'white'})
      }
    },
    async enterNameSecond () {
      try {
        this.$log('changeNameSecond start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.nameSecond',
          value: this.nameSecond
        })
        this.$log('changeNameSecond done', res)
      } catch (e) {
        this.$log('changeNameSecond ERROR', e)
        this.$q.notify({message: 'Cant change Second name', color: 'red', textColor: 'white'})
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
      if (this.slide === '3') this.next = '4'
      this.slide = this.next
      if (this.next === '4') this.$emit('hide')
    },
    secondSlide () {
      this.slide = '2'
      this.chosenLanguage(this.lang)
      this.enterNameSecond(this.nameSecond)
      this.enterNameFirst(this.nameFirst)
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
