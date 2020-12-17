<template lang="pug">
.row.full-width.q-pa-lg
  .col
  .col
    .row.full-width.justify-center
      div(:style=`{width: '150px',height: '150px',borderRadius: '50%'}`).row.b-40
        div(:style=`{height: '50px'}`).row.full-width
          .col
          .col
            q-btn(
              round flat color="grey-4" icon="north"
              :style=`{borderRadius: '50%',}`).fit
          .col
        div(:style=`{height: '50px'}`).row.full-width
          .col
            q-btn(
              round flat color="grey-4" icon="west"
              :style=`{borderRadius: '50%',}`).fit
          .col
            q-btn(
              color="green" icon="add"
              :style=`{borderRadius: '50%',}`).fit.bg
          .col
            q-btn(
              round flat color="grey-4" icon="east"
              :style=`{borderRadius: '50%',}`).fit
        div(:style=`{height: '50px'}`).row.full-width
          .col
          .col
            q-btn(
              round flat color="grey-4" icon="south"
              :style=`{borderRadius: '50%',}`).fit
          .col
</template>
