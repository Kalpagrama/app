<template lang="pug">
div(id="q-app").bg-grey-3
  router-view
  div(v-if="!$store.state.core.online" :style=`{position: 'relative', zIndex: 100000, top: '0px', height: '15px'}`).row.full-width.justify-end.items-center.q-px-md.bg-red-4
    small(style=`{font-size: 8px}`).text-bold.text-primary {{'offline'}}
</template>
