<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  :container="false"
  ).b-30
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
        //- video
        section-video
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
            p.text-white Добавляйте контент из YouTube, Twitter, Instagram. Можно загрузить файл с устройства. Книги музыка фильмы - все можно сохранять к себе в мастерскую.
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
            p.text-white Находите смыслы и создавайте смысловые ядра, Пришло озарение ? Создайте ядро и поделитесь своим пониманием с другими. Смысловое ядро - это смысл найденный во фрагменте из видеоролика, книги или аудио, который вы опубликовали в Кальпаграме. Если вы не хотите делать найденный смысл общедоступным - вы просто сохраняете его в заметки.
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
            p.text-white Смысловые ядра можно связывать друг с другом, раскрывая новые смыслы в сравнении. Суть связей может выражаться парой: Причина-Следствие, Проблема-Решение, Факт-Опровержение, Вопрос-Ответ и т.д. Или, например, можно соединить фрагмент из книги и отрывок фильма с одинаковым смыслом. Таким образом связи помогают увидеть картину шире и становятся отправной точкой для исследования.
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
                v-for="(r,ri) in $rateMeta" :key="ri"
                :style=`{
                  position: 'absolute', zIndex: 100+ri,
                  width: 100-(6*ri+1)+'%',
                  height: 100-(6*ri+1)+'%',
                  borderRadius: '50%',
                  background: $rateMeta[ri].colorBackground,
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
        //- voting extended
        div(:style=`{zIndex: 10,}`).row.full-width.justify-center.q-pt-md.q-pa-sm
          div(
            :style=`{
              maxWidth: width-60+'px',
              textAlign: 'justify',
            }`
            ).row.full-width.items-start.content-start
            p.text-white Голосуйте за ядра и связи. Шкала для голосования состоит из пяти элементов. У каждого свой цвет.
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
                  v-for="r in $rateMeta" :key="r.value"
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
            p.text-white Голосуя, вы определяете насколько близко к сути ядро или связь, что так же отражается на рейтинге автора. Чем больше этот рейтинг, тем сильнее голос пользователя повлияет на рейтинг ядра или связи за которые он проголосовал. Всё что опубликовано в Кальпаграме - объединяется в глобальную карту знаний.  Раположение элементов на этой карте определено голосованием сообщества. Теперь пользователи определяют и проверяют истинность информации. Не алгоритмы и корпорации, а ВЫ решаете, что будет в центре внимания.
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
import sectionVideo from './section_video.vue'

export default {
  name: 'pageApp_about',
  components: {
    sectionVideo,
    nodeVoteBall: () => import('src/components/node/node_vote_ball.vue')
  },
  data () {
    return {
    }
  },
  computed: {
    width () {
      return Math.min(400, this.$store.state.ui.pageWidth - 16, this.$q.screen.width)
    },
  }
}
</script>
