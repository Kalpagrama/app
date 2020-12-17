<template lang="pug">
.row.full-width.justify-center.q-pa-md
  div(
    :style=`{
      position: 'relative',
      maxWidth: '300px',
      borderRadius: '10px',
    }`
    ).row.full-width.b-40
    .col
      q-btn(
        @click="itemPrev()"
        flat color="grey-4" icon="west"
        ).fit
    .col
      .row.fit
        div(:style=`{width: '50px',}`).row.full-height.items-center.content-center
          q-btn(
            @click="jointEditStart()"
            flat color="green" icon="add"
            ).fit
        div(:style=`{width: '50px',}`).row.full-height.items-center.content-center
          q-btn(
            round flat color="grey-4" icon="keyboard_arrow_up"
            ).full-width.q-py-sm
          q-btn(
            round flat color="grey-4" icon="keyboard_arrow_down"
            ).full-width.q-py-sm
        div(:style=`{width: '50px',}`).row.full-height.items-center.content-center
          q-btn(
            @click="itemNext()"
            flat color="grey-4" icon="keyboard_arrow_right"
            ).fit
</template>
