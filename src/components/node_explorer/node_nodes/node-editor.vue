<template lang="pug">
//- node editor
q-dialog(
  v-model="nodeEditorOpened" position="bottom")
  ws-node-editor(
    @published="nodePublished"
    @close="nodeEditorOpened = false"
    extendType="node"
    :extendOid="node.oid"
    :value="nodeEditorItem"
    :options=`{
      ctx: 'extend',
    }`
    :style=`{
      maxWidth: '800px',
      maxHeight: $q.screen.height-0+'px',
      minHeight: $q.screen.height-0+'px',
    }`)
    template(v-slot:header)
      .row.full-width.items-center.content-center.justify-between.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="nodeEditorOpened = false")
        span(:style=`{fontSize: '16px'}`).text-white.text-bold Расширяем ядро
        q-btn(round flat color="white" icon="more_vert")
        .row.full-width.justify-center.q-py-md
          div(:style=`{maxWidth: '600px'}`).row.full-width.q-px-sm
            img(:src="node.items[0].thumbUrl" :style=`{height: '100px', borderRadius: '10px',}`)
            .col
              .row.fit.items-between.content-between.q-pa-sm
                span.text-white.text-bold {{ node.name }}
                .row.full-width.q-px-xs
                  q-icon(name="emoji_people" color="white" size="20px")
                  span(:style=`{fontSize: '15px'}`).text-white.text-bold {{ Math.round(node.rate * 100) }}
                .row.full-width
                  div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.b-60.q-pa-xs
                    img(:src="node.author.thumbUrl" :style=`{width: '20px', height: '20px', borderRadius: '50%',}`).q-mr-sm
                    span.text-grey-5 {{ node.author.name }}
</template>