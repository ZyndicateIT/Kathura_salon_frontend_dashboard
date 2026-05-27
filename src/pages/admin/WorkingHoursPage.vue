<template>
  <div class="space-y-6">
    <!-- Working Hours -->
    <div class="card">
      <div class="px-5 py-4 border-b border-beige-100">
        <h3 class="font-serif font-semibold text-salon-dark">Working Days & Hours</h3>
        <p class="text-xs text-beige-400 mt-0.5">Configure open days, hours, and slot duration</p>
      </div>
      <div class="p-5 space-y-3">
        <div v-for="wh in workingHours" :key="wh.id" class="flex items-center gap-4 p-3 rounded-xl bg-beige-50">
          <div class="w-12 text-xs font-semibold text-salon-charcoal">{{ dayName(wh.dayOfWeek) }}</div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="wh.isOpen" class="w-4 h-4 accent-salon-gold" @change="wh.isOpen = $event.target.checked" />
            <span class="text-xs text-salon-charcoal">Open</span>
          </label>
          <template v-if="wh.isOpen">
            <input type="time" v-model="wh.openTime"  class="input-field text-xs py-1 max-w-[110px]" />
            <span class="text-beige-400 text-xs">to</span>
            <input type="time" v-model="wh.closeTime" class="input-field text-xs py-1 max-w-[110px]" />
            <div class="flex items-center gap-1">
              <select v-model.number="wh.slotDuration" class="input-field text-xs py-1 max-w-[90px]">
                <option :value="15">15 min</option>
                <option :value="30">30 min</option>
                <option :value="45">45 min</option>
                <option :value="60">60 min</option>
              </select>
            </div>
          </template>
          <span v-else class="text-xs text-beige-400 italic">Closed</span>
          <Button size="sm" class="ml-auto" :loading="saving === wh.id" @click="saveHours(wh)">Save</Button>
        </div>
      </div>
    </div>

    <!-- Blocked Slots -->
    <div class="card">
      <div class="flex items-center justify-between px-5 py-4 border-b border-beige-100">
        <div>
          <h3 class="font-serif font-semibold text-salon-dark">Blocked Dates / Times</h3>
          <p class="text-xs text-beige-400 mt-0.5">Dates or time ranges when the salon is unavailable</p>
        </div>
        <Button @click="showBlockForm = true" size="sm">+ Add Block</Button>
      </div>
      <div class="p-5">
        <div v-if="!blockedSlots.length" class="text-center py-6 text-beige-400">No blocked slots</div>
        <div class="space-y-2">
          <div v-for="slot in blockedSlots" :key="slot.id" class="flex items-center justify-between p-3 rounded-xl bg-red-50">
            <div>
              <p class="text-sm font-medium text-red-700">{{ formatDate(slot.date) }}</p>
              <p class="text-xs text-red-500">
                {{ slot.allDay ? 'All day' : `${slot.startTime} — ${slot.endTime}` }}
                {{ slot.reason ? `· ${slot.reason}` : '' }}
              </p>
            </div>
            <Button size="sm" variant="danger" @click="deleteBlock(slot.id)">Remove</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Block Modal -->
    <Modal v-model="showBlockForm" title="Block Date / Time">
      <div class="space-y-4">
        <div>
          <label class="label">Date</label>
          <input v-model="blockForm.date" type="date" required class="input-field" />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="blockForm.allDay" type="checkbox" id="allDay" class="w-4 h-4 accent-salon-gold" />
          <label for="allDay" class="text-sm text-salon-charcoal">Block entire day</label>
        </div>
        <div v-if="!blockForm.allDay" class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Start Time</label>
            <input v-model="blockForm.startTime" type="time" class="input-field" />
          </div>
          <div>
            <label class="label">End Time</label>
            <input v-model="blockForm.endTime" type="time" class="input-field" />
          </div>
        </div>
        <div>
          <label class="label">Reason (optional)</label>
          <input v-model="blockForm.reason" placeholder="e.g. Holiday, Staff training..." class="input-field" />
        </div>
      </div>
      <template #footer>
        <Button variant="ghost" @click="showBlockForm = false">Cancel</Button>
        <Button :loading="savingBlock" @click="saveBlock">Add Block</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from '../../components/ui/Button.vue'
import Modal  from '../../components/ui/Modal.vue'
import api    from '../../services/api.js'

const workingHours  = ref([])
const blockedSlots  = ref([])
const saving        = ref(null)
const savingBlock   = ref(false)
const showBlockForm = ref(false)
const blockForm     = ref({ date: '', allDay: false, startTime: '', endTime: '', reason: '' })

const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const dayName  = (i) => dayNames[i]
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

const fetchAll = async () => {
  try {
    const [h, b] = await Promise.all([api.get('/working-hours'), api.get('/working-hours/blocked')])
    workingHours.value = h.data.data
    blockedSlots.value = b.data.data
  } catch { /* ignore */ }
}

const saveHours = async (wh) => {
  saving.value = wh.id
  try {
    await api.put(`/working-hours/${wh.id}`, {
      isOpen: wh.isOpen, openTime: wh.openTime, closeTime: wh.closeTime, slotDuration: wh.slotDuration,
    })
  } catch { /* ignore */ } finally { saving.value = null }
}

const saveBlock = async () => {
  savingBlock.value = true
  try {
    await api.post('/working-hours/blocked', blockForm.value)
    await fetchAll()
    showBlockForm.value = false
    blockForm.value = { date: '', allDay: false, startTime: '', endTime: '', reason: '' }
  } catch { /* ignore */ } finally { savingBlock.value = false }
}

const deleteBlock = async (id) => {
  try { await api.delete(`/working-hours/blocked/${id}`); await fetchAll() } catch { /* ignore */ }
}

onMounted(fetchAll)
</script>
