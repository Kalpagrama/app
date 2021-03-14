<template lang="pug">
div(
  :style=`{
    order: orderHeader,
  }`
  ).row.full-width.items-center.content-center.q-px-sm.q-py-xs
  q-btn(
    v-if="showAuthorAlways || node.rateUser !== null"
    :to="'/user/'+node.author.oid"
    round flat color="white" no-caps
    ).row
    img(
      draggable="false"
      :src="node.author.thumbUrl"
      :style=`{
        width: '24px', minWidth: '24px', maxWidth: '24px',
        height: '24px', minHeight: '24px', maxHeight: '24px',
        borderRadius: '50%',
      }`)
    .col
      .row.items-center.content-center.q-px-sm.q-mb-xs
        span.text-grey-4 {{ node.author.name }}
        .row.full-width
          small(:style=`{lineHeight: 0.5}`).text-grey-6 @username
  div(
    v-else
    :style=`{
      height: '40px',
    }`
    ).row.items-center.content-center.q-pa-sm
    div(:style=`{width: '24px',minWidth: '24px',height: '24px',minHeight: '24px',borderRadius: '50%',}`).b-50.q-mr-sm
    .col
      div(:style=`{width: '80px', minWidth: '80px', height: '14px', borderRadius: '10px'}`).b-40
  .col
  .row.items-center.content-center.justify-end.q-pr-sm
    small.text-grey-8 {{ $date(node.createdAt, 'DD.MM.YYYY') }}
    .row.full-width.items-center.content-center.justify-end
      q-icon(name="visibility" color="grey-9").q-mr-xs
      small(:style=`{lineHeight: 0.5}`).text-grey-8 {{ node.countStat.countViews }}
  //- kalpa-menu-actions(
    :title="node.name"
    :actions="actions" icon="more_vert")
</template>

<script>
export default {
  name: 'nodeHeader',
  props: ['node', 'showAuthorAlways']
}
</script>
