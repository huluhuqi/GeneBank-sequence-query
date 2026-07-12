<template>
  <Transition name="collapse" @enter="onEnter" @leave="onLeave">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
function onEnter(el: Element) {
  const target = el as HTMLElement
  target.style.height = '0'
  target.style.overflow = 'hidden'
  target.style.transition = 'height 0.3s ease'
  requestAnimationFrame(() => {
    target.style.height = target.scrollHeight + 'px'
  })
  target.addEventListener('transitionend', function handler() {
    target.style.height = ''
    target.style.overflow = ''
    target.style.transition = ''
    target.removeEventListener('transitionend', handler)
  })
}

function onLeave(el: Element) {
  const target = el as HTMLElement
  target.style.height = target.scrollHeight + 'px'
  target.style.overflow = 'hidden'
  target.style.transition = 'height 0.3s ease'
  requestAnimationFrame(() => {
    target.style.height = '0'
  })
  target.addEventListener('transitionend', function handler() {
    target.removeEventListener('transitionend', handler)
  })
}
</script>
