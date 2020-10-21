<template lang="pug">
.row.full-width
  .row.full-width.q-pa-sm
    .col-6.q-pr-xs
      div(
        :style=`{
          position: 'relative',
          height: 0, paddingBottom: '100%',
          borderRadius: '50%',
        }`
        ).row.full-width.b-40
        div(:style=`{position: 'absolute', zIndex: 10,}`).row.fit.items-center.content-center.justify-center
          small.text-white {{ $route.query.oid }}
    .col-6.q-pl-xs
      div(
        :style=`{
          height: 0, paddingBottom: '100%',
          borderRadius: '50%',
        }`
      ).row.full-width.b-40
  div(:style=`{marginTop: '-80px',}`).row.full-width.justify-center.q-mb-sm
    div(
      :style=`{
        width: '50%',
      }`
      ).row
      div(
        :style=`{
          height: 0, paddingBottom: '100%',
          borderRadius: '50%',
        }`
        ).row.full-width.b-40
</template>