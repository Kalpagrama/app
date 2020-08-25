<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="fab fa-twitter" color="blue-5" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white Это клон твиттора
          .col
  q-page-container
    q-page(:style=`{paddingTop: '0px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        router-view
</template>

<script>
export default {
  name: 'pageApp__twitter',
}
</script>
