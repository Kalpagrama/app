<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-page-container
    q-page.row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px'
        }`
        ).row.full-width.items-start.content-start
        //- welcome, nodes
        .row.full-width.justify-center.q-pt-md
          kalpa-logo(:width="220" :height="220" :style=`{pointEvents: 'none'}`)
        div(:style=`{zIndex: 10,}`).row.full-width.justify-center.q-pt-md.q-pa-sm
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
            }`
          ).row.full-width.items-start.content-start
            p.text-white Вы замечали, что при просмотре фильма, прослушивании музыки, чтении книг, какие-то моменты вызывают у вас озарения, ассоциации или взаимосвязи, которые есть только у вас и другие их не видят?
            p.text-white Теперь вы сможете запечатлеть их, сохранить и поделиться с другими.
            p.text-white Мы верим в то, что люди самостоятельно могут докопаться до истины, и для этого им просто нужен удобный инструмент.
            p.text-white Который помогает быстро вникать в суть вещей и делать новые открытия, с помощью коллективной мудрости.
            p.text-white Все это возможно в Кальпаграме - платформе коллективного мышления.
            .row.full-width
              div(
                v-for="n in 5" :key="n"
                :style=`{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'rgb(35,35,35)',
                }`).q-mr-sm
        //- content
        .row.full-width.justify-center.q-mt-lg
          q-icon(name="select_all" color="grey-5" size="300px")
        div(:style=`{zIndex: 10,}`).row.full-width.justify-center.q-pt-md.q-pa-sm
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
            }`
          ).row.full-width.items-start.content-start
            p.text-white Добавляйте контент из YouTube, Twitter, Instagram. Загрузить с устройства. Книги музыка фильмы, все можно сохранять себе в мастерскую.
            .row.full-width
              div(
                v-for="n in 5" :key="n"
                :style=`{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'rgb(35,35,35)',
                }`).q-mr-sm
        //- nodes
        .row.full-width.justify-center.q-pt-md
          q-icon(name="adjust" color="grey-5" size="276px")
        div(:style=`{zIndex: 10,}`).row.full-width.justify-center.q-pt-md.q-pa-sm
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
            }`
          ).row.full-width.items-start.content-start
            p.text-white Находите смыслы, создавайте ядра, Пришло озарение ? Создай ядро, поделись своим знанием с другими.
            .row.full-width
              div(
                v-for="n in 5" :key="n"
                :style=`{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'rgb(35,35,35)',
                }`).q-mr-sm
          //- q-icon(name="adjust" color="grey-5" size="300px")
        //- joints
        .row.full-width.justify-center.q-mt-xl
          q-icon(name="fas fa-link" color="grey-5" size="236px")
        div(:style=`{zIndex: 10,}`).row.full-width.justify-center.q-pt-md.q-pa-sm
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
            }`
            ).row.full-width.items-start.content-start
            p.text-white Смысловые ядра можно связывать друг с другом, раскрывая новые смыслы в сравнении.
            p.text-white Суть связей может выражаться парой: Причина-Следствие, Проблема-Решение, Факт-Опровержение и Вопрос-Ответ.
            .row.full-width
              div(
                v-for="n in 5" :key="n"
                :style=`{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'rgb(35,35,35)',
                }`).q-mr-sm
        //- vote
        .row.full-width.justify-center.q-pt-xl
          div(
            :style=`{
              position: 'relative',
              width: '240px',
              height: '240px',
            }`
            ).row.items-center.content-center.justify-center
            div(
              :style=`{
                position: 'relative',
              }`).row.fit.items-center.content-center.justify-center
              div(
                v-for="(r,ri) in rateMeta" :key="ri"
                :style=`{
                  position: 'absolute', zIndex: 100+ri,
                  width: 100-(6*ri+1)+'%',
                  height: 100-(6*ri+1)+'%',
                  borderRadius: '50%',
                  background: rateMeta[ri].colorBackground,
                }`)
            div(
              :style=`{
                position: 'absolute', zIndex: 300,
                width: '70%', minWidth: '70%', maxWidth: '70%',
                height: '70%', minHeight: '70%', maxHeight: '70%',
                borderRadius: '50%',
                padding: '4px',
              }`
              ).row.items-center.content-center.justify-center.b-30
        div(:style=`{zIndex: 10,}`).row.full-width.justify-center.q-pt-md.q-pa-sm
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
            }`
            ).row.full-width.items-start.content-start
            p.text-white Голосуйте, с помощью голосваний, а не простых "лайков" пользователи сами решают что будет подниматься или опускаться в трендах.
          div(
            :style=`{
              maxWidth: width+'px',
            }`
            ).row.full-width
            div(
              :style=`{
                height: '20px',
              }`
              ).row.full-width
              div(
                :style=`{
                  borderRadius: '10px',
                  overflow: 'hidden',
                }`
                ).row.fit.items-center.content-center
                div(
                  v-for="r in rateMeta" :key="r.value"
                  :style=`{
                    background: rateOver === r.value ? r.color : r.colorBackground,
                  }`
                  ).col.full-height
                  div(
                    ).row.fit.items-center.content-center.justify-center.cursor-pointer
                    q-spinner(
                      v-if="voteVoting === r.value"
                      color="white" size="10px")
                    small(
                      v-else
                      :style=`{
                        fontSize: '8.5px', pointerEvents: 'none', userSelect: 'none',
                        whiteSpace: 'nowrap'
                      }`).text-white {{ r.name }}
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
              paddingBottom: '100px',
            }`
            ).row.full-width.items-start.content-start.q-pt-md
            p.text-white Голосование состоит из пяти цветов градаций. Вы определяете насколько близко к сути ядро или связь.
            .row.full-width
              div(
                v-for="n in 5" :key="n"
                :style=`{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: 'rgb(35,35,35)',
                }`).q-mr-sm
</template>

<script>
import { EventApi } from 'src/api/event'

export default {
  name: 'pageApp_about',
  components: {
    nodeVoteBall: () => import('components/node/node_vote_ball.vue')
  },
  methods: {
  },
  computed: {
    width () {
      return Math.min(400, this.$store.state.ui.pageWidth - 16, this.$q.screen.width)
    },
    rateMeta () {
      return [
        {name: EventApi.verbalizeRate(0.2), value: 0, valueMin: -1, valueMax: 0.2, color: 'rgba(255,26,5,1)', colorBackground: 'rgba(255,26,5,0.5)', order: 5},
        {name: EventApi.verbalizeRate(0.4), value: 0.25, valueMin: 0.2, valueMax: 0.4, color: 'rgba(255,221,2,0.7)', colorBackground: 'rgba(255,221,2,0.5)', order: 4},
        {name: EventApi.verbalizeRate(0.6), value: 0.5, valueMin: 0.4, valueMax: 0.6, color: 'rgba(75,172,79,0.7)', colorBackground: 'rgba(75,172,79,0.5)', order: 3},
        {name: EventApi.verbalizeRate(0.8), value: 0.75, valueMin: 0.6, valueMax: 0.8, color: 'rgba(44,85,179,0.7)', colorBackground: 'rgba(44,85,179,0.5)', order: 2},
        {name: EventApi.verbalizeRate(1), value: 1, valueMin: 0.8, valueMax: 2, color: 'rgba(113,49,164,1)', colorBackground: 'rgba(113,49,164,0.5)', order: 1}
      ]
    },
  },
}
</script>
