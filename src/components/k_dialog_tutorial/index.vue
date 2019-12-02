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
    q-carousel-slide(name="1").row.fit.justify-center.items-center
      .row.full-width.justify-center.q-mt-sm
        k-logo(:width="100" :height="100")
      .row.full-width.justify-center
        span.text-h6 KALPAGRAMMA
        .row.full-width.justify-center
          span essence is near...
      div(style=`width: 200px; height: 200px; border-radius: 10px`).row.full-width.justify-items-center.bg-grey-1.q-mt-md.shadow-5
      //- .row.full-width.justify-center.q-mt-md
      //-   <iframe width="280" height="157,5" src="https://www.youtube-nocookie.com/embed/MwYbCLJCV8s" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      .row.full-width.justify-end.self-end.q-mt-xl
        q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" label="Next")
    q-carousel-slide(name="2").row.fit.justify-center.items-center
      .row.justify-center.content-center
        div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
          q-icon(name="person_add" size="56px")
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-h5 Find and Follow Facebook Friends
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-grey-4 You decide who to subscribe to. We will never post to Facebook without your permission.
        .row.full-width.justify-center.q-mt-lg
          q-btn(unelevated color="accent") Connect Facebook
      .row.full-width.justify-end.self-end
        q-btn(flat color="accent" @click="nextSlide()") Skip
    q-carousel-slide(name="3").row.justify-center.items-center
      .row.justify-center.content-center
        div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
          q-icon(name="add_a_photo" size="56px")
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-h5 Add a profile photo
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-grey-4 Add a profile photo that friends could recognize you.
        .row.full-width.justify-center.q-mt-lg
          q-btn(unelevated color="accent") Add a photo
      .row.full-width.justify-end.self-end
        q-btn(flat color="accent" @click="nextSlide()") Skip
    q-carousel-slide(name="4").row.justify-center.content-start
      div(style=`height: 30%`).row
        .row.full-width.justify-start
          span(style='width: 160px').text-h6 Welcome to the Kalpagramma
          .col
          q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" label="Next")
        .row.full-width.justify-start
          span Choose at least 5 to get started.
      div(style=`height: 70%`).row.full-width.justify-center.scroll
        div(v-for="(c, ci) in contentList" :key="ci" @click="chosenContent()").row.justify-center.q-ma-xs
          div(:style=`{width: '6em', height: '6em', overflow: 'hidden', borderRadius: '10px', backgroundSize: 'cover', backgroundImage: 'url(' + c.thumbUrl + ')'}`).row.justify-start
            div(style=`backgroundColor: rgba(0, 0, 0, 0.4)`).row.fit.q-pa-xs
              small.self-end {{$t(c.name)}}
              .col
              div(v-if="chosen === true" :style=`{width: '20px', height: '20px', borderRadius: '50%'}`).row.justify-center.items-center.bg-white
                q-icon(name="done" size="20px" color="black")
</template>

<script>
export default {
  name: 'kDialogTutorial',
  data () {
    return {
      chosen: null,
      slide: '1',
      next: '',
      lorem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit',
      contentList: [
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''}
      ]
    }
  },
  methods: {
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
      if (this.slide === '4') this.next = '5'
      this.slide = this.next
      if (this.next === '5') this.$refs.tutorialDialog.toggle()
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
