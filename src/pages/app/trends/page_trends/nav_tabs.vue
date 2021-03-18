<template lang="pug">
.row.full-width.justify-center.b-30
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md
    q-tabs(
      :value="$route.params.oid"
      dense no-caps active-color="green" switch-indicator
      @input="$router.push({params: {oid: $event}})"
      ).full-width.text-grey-8
      q-tab(
        v-for="c in $store.state.ui.nodeCategories"
        :key="c.sphere.oid"
        dense
        :name="c.sphere.oid"
        :label="c.alias")
</template>

<script>
export default {
  name: 'navTabs',
}
</script>
