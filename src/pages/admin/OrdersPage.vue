<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-wrap gap-1 rounded-xl border border-beige-200 bg-white p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.value ? 'bg-salon-gold text-white' : 'text-beige-400 hover:text-salon-dark',
          ]"
          @click="setTab(tab.value)"
        >
          {{ tab.label }}
          <span
            :class="[
              'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
              activeTab === tab.value ? 'bg-white/20' : 'bg-beige-100',
            ]"
          >
            {{ tabCounts[tab.value] || 0 }}
          </span>
        </button>
      </div>

      <Button @click="openCreateModal">+ Add Order</Button>
    </div>

    <div
      v-if="notice"
      :class="[
        'rounded-xl border px-4 py-3 text-sm',
        notice.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700',
      ]"
    >
      {{ notice.message }}
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        v-model="search"
        type="text"
        placeholder="Search by name, reference, phone or email..."
        class="input-field w-full sm:max-w-sm"
        @input="filterBookings"
      />
      <p class="text-xs text-beige-400">
        {{ filtered.length }} booking(s) in {{ activeTabLabel.toLowerCase() }}
      </p>
    </div>

    <div v-if="loading" class="py-12 text-center text-beige-400">Loading bookings...</div>
    <div v-else-if="!filtered.length" class="card p-12 text-center">
      <p class="font-medium text-beige-400">No bookings found</p>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <BookingCard
        v-for="booking in filtered"
        :key="booking.id"
        :booking="booking"
        @view="openDetail(booking)"
        @accept="updateStatus(booking, 'ACCEPTED')"
        @complete="updateStatus(booking, 'COMPLETED')"
        @cancel="updateStatus(booking, 'CANCELLED')"
        @delete="confirmDelete(booking)"
      />
    </div>

    <Modal v-model="showDetail" :title="selected ? `Booking - ${selected.reference}` : 'Booking Details'" size="lg">
      <div v-if="selected" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-wide text-beige-400">Customer</p>
            <p class="font-medium text-salon-dark">{{ selected.customerName }}</p>
            <p class="text-sm text-beige-400">{{ selected.customerPhone }}</p>
            <p v-if="selected.customerEmail" class="text-sm text-beige-400">{{ selected.customerEmail }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-beige-400">Appointment</p>
            <p class="font-medium text-salon-dark">{{ formatDate(selected.appointmentDate) }}</p>
            <p class="text-sm text-beige-400">{{ selected.appointmentTime }}</p>
            <p class="mt-1 text-sm text-beige-400">
              <span class="text-xs uppercase tracking-wide text-beige-300">Stylist: </span>
              {{ selected.stylist?.name || 'Any Stylist' }}
            </p>
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs uppercase tracking-wide text-beige-400">Services</p>
          <div class="space-y-1">
            <div v-for="service in selected.services" :key="service.id" class="flex justify-between text-sm">
              <span>{{ service.service?.name }} ({{ service.duration }} min)</span>
              <span class="font-medium">Rs. {{ Number(service.price).toLocaleString() }}</span>
            </div>
          </div>
          <div class="mt-2 flex justify-between border-t border-beige-100 pt-2 font-semibold">
            <span>Total ({{ selected.totalDuration }} min)</span>
            <span class="text-salon-gold">Rs. {{ Number(selected.totalPrice).toLocaleString() }}</span>
          </div>
        </div>
        <div v-if="selected.notes" class="rounded-lg bg-beige-50 p-3 text-sm text-salon-charcoal">
          <p class="mb-1 font-medium">Notes</p>
          {{ selected.notes }}
        </div>
        <div class="flex items-center justify-between pt-2">
          <StatusBadge :status="selected.status" />
          <div class="flex gap-2">
            <Button
              v-if="selected.status === 'PENDING'"
              variant="success"
              size="sm"
              @click="updateStatus(selected, 'ACCEPTED'); showDetail = false"
            >
              Accept
            </Button>
            <Button
              v-if="selected.status === 'ACCEPTED'"
              variant="gold"
              size="sm"
              @click="updateStatus(selected, 'COMPLETED'); showDetail = false"
            >
              Complete
            </Button>
            <Button
              v-if="['PENDING', 'ACCEPTED'].includes(selected.status)"
              variant="danger"
              size="sm"
              @click="updateStatus(selected, 'CANCELLED'); showDetail = false"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>

    <Modal v-model="showCreateForm" title="Add Manual Order" size="xl">
      <div class="space-y-4">
        <div v-if="createError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ createError }}
        </div>

        <div v-if="loadingOptions" class="rounded-xl bg-beige-50 px-4 py-10 text-center text-sm text-beige-400">
          Loading services and stylists...
        </div>

        <form v-else class="max-h-[70vh] space-y-6 overflow-y-auto pr-2" @submit.prevent="submitManualOrder">
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div class="space-y-4">
              <div>
                <label class="label">Customer Name</label>
                <input
                  v-model="createForm.customerName"
                  required
                  placeholder="e.g. Nimal Perera"
                  class="input-field"
                />
              </div>

              <div>
                <label class="label">Phone Number</label>
                <input
                  v-model="createForm.customerPhone"
                  required
                  placeholder="e.g. 0771234567"
                  class="input-field"
                />
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="label">Appointment Date</label>
                  <input
                    v-model="createForm.appointmentDate"
                    type="date"
                    :min="minDate"
                    required
                    class="input-field"
                  />
                </div>
                <div>
                  <label class="label">Stylist (optional)</label>
                  <select v-model="createForm.stylistId" class="input-field">
                    <option value="">Any available stylist</option>
                    <option v-for="stylist in stylists" :key="stylist.id" :value="String(stylist.id)">
                      {{ stylist.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="rounded-xl border border-beige-200 bg-beige-50 p-4">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p class="font-medium text-salon-dark">Available Time Slots</p>
                    <p class="text-xs text-beige-400">Select services and a date to load availability</p>
                  </div>
                  <Button size="sm" variant="outline" :disabled="!canLoadSlots || loadingSlots" @click="fetchAvailableSlots">
                    Refresh
                  </Button>
                </div>

                <div v-if="!totalDuration" class="text-sm text-beige-400">
                  Select at least one service to calculate duration.
                </div>
                <div v-else-if="!createForm.appointmentDate" class="text-sm text-beige-400">
                  Select an appointment date to see available time slots.
                </div>
                <div v-else-if="loadingSlots" class="py-6 text-center text-sm text-beige-400">
                  Loading slots...
                </div>
                <div
                  v-else-if="!slots.available"
                  class="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-600"
                >
                  {{ slots.reason || 'No slots available for this date.' }}
                </div>
                <div
                  v-else-if="!slots.slots.length"
                  class="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-3 text-sm text-yellow-700"
                >
                  No slots available for the selected date.
                </div>
                <div v-else class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  <button
                    v-for="slot in slots.slots"
                    :key="slot.time"
                    type="button"
                    :class="[
                      'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                      createForm.appointmentTime === slot.time
                        ? 'border-salon-gold bg-salon-gold text-white'
                        : 'border-beige-200 bg-white text-salon-charcoal hover:border-salon-gold hover:text-salon-gold',
                    ]"
                    @click="createForm.appointmentTime = slot.time"
                  >
                    {{ slot.time }}
                  </button>
                </div>
              </div>

              <div>
                <label class="label">Notes (optional)</label>
                <textarea
                  v-model="createForm.notes"
                  rows="4"
                  placeholder="Add any special requests or booking notes..."
                  class="input-field min-h-[120px]"
                />
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-salon-dark">Select Services</p>
                  <p class="text-xs text-beige-400">At least one service is required</p>
                </div>
                <span class="text-xs text-beige-400">{{ createForm.serviceIds.length }} selected</span>
              </div>

              <div
                v-if="!services.length"
                class="rounded-xl border border-beige-200 bg-beige-50 px-4 py-6 text-sm text-beige-400"
              >
                No active services found.
              </div>
              <div v-else class="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                <label
                  v-for="service in services"
                  :key="service.id"
                  :class="[
                    'flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors',
                    createForm.serviceIds.includes(service.id)
                      ? 'border-salon-gold bg-gold-50'
                      : 'border-beige-200 bg-white hover:border-salon-gold/60',
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      class="mt-1 h-4 w-4 accent-salon-gold"
                      :checked="createForm.serviceIds.includes(service.id)"
                      @change="toggleServiceSelection(service.id)"
                    />
                    <div>
                      <p class="font-medium text-salon-dark">{{ service.name }}</p>
                      <p class="text-xs text-beige-400">{{ service.duration }} minutes</p>
                    </div>
                  </div>
                  <span class="text-sm font-semibold text-salon-gold">
                    Rs. {{ Number(service.price).toLocaleString() }}
                  </span>
                </label>
              </div>

              <div class="space-y-3 rounded-xl border border-beige-200 bg-beige-50 p-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-beige-400">Total duration</span>
                  <span class="font-semibold text-salon-dark">{{ totalDuration }} min</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-beige-400">Estimated total</span>
                  <span class="text-lg font-bold text-salon-gold">Rs. {{ totalPrice.toLocaleString() }}</span>
                </div>
                <div v-if="selectedServices.length" class="border-t border-beige-200 pt-3">
                  <p class="mb-2 text-xs uppercase tracking-wide text-beige-400">Selected services</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="service in selectedServices"
                      :key="service.id"
                      class="rounded-full border border-beige-200 bg-white px-3 py-1 text-xs font-medium text-salon-charcoal"
                    >
                      {{ service.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <template #footer>
        <Button variant="ghost" :disabled="creating" @click="showCreateForm = false">Cancel</Button>
        <Button :loading="creating" :disabled="loadingOptions || !services.length" @click="submitManualOrder">
          Create Order
        </Button>
      </template>
    </Modal>

    <Modal v-model="showDeleteConfirm" title="Delete Booking" size="sm">
      <p class="text-salon-charcoal">
        Are you sure you want to delete booking <strong>{{ deleteTarget?.reference }}</strong>? This cannot be undone.
      </p>
      <template #footer>
        <Button variant="ghost" @click="showDeleteConfirm = false">Cancel</Button>
        <Button variant="danger" :loading="deleting" @click="doDelete">Delete</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BookingCard from '../../components/ui/BookingCard.vue'
import Button from '../../components/ui/Button.vue'
import Modal from '../../components/ui/Modal.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import api from '../../services/api.js'
import { formatDateOnly, formatLocalDateInput } from '../../utils/date.js'

const tabs = [
  { label: 'New Booking', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const emptySlots = () => ({ available: false, slots: [], reason: '' })
const emptyOrderForm = () => ({
  customerName: '',
  customerPhone: '',
  appointmentDate: '',
  appointmentTime: '',
  stylistId: '',
  notes: '',
  serviceIds: [],
})

const activeTab = ref('PENDING')
const search = ref('')
const loading = ref(false)
const deleting = ref(false)
const creating = ref(false)
const loadingOptions = ref(false)
const loadingSlots = ref(false)
const allBookings = ref([])
const services = ref([])
const stylists = ref([])
const slots = ref(emptySlots())
const showDetail = ref(false)
const showCreateForm = ref(false)
const showDeleteConfirm = ref(false)
const selected = ref(null)
const deleteTarget = ref(null)
const notice = ref(null)
const createError = ref('')
const createForm = ref(emptyOrderForm())

const minDate = computed(() => formatLocalDateInput(new Date()))

const activeTabLabel = computed(() =>
  tabs.find((tab) => tab.value === activeTab.value)?.label || 'Booking'
)

const tabCounts = computed(() => {
  const counts = { PENDING: 0, ACCEPTED: 0, COMPLETED: 0, CANCELLED: 0 }
  allBookings.value.forEach((booking) => {
    if (counts[booking.status] !== undefined) counts[booking.status]++
  })
  return counts
})

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return allBookings.value.filter((booking) => {
    if (booking.status !== activeTab.value) return false
    if (!query) return true

    return (
      String(booking.customerName || '').toLowerCase().includes(query) ||
      String(booking.reference || '').toLowerCase().includes(query) ||
      String(booking.customerPhone || '').toLowerCase().includes(query) ||
      String(booking.customerEmail || '').toLowerCase().includes(query)
    )
  })
})

const selectedServices = computed(() =>
  services.value.filter((service) => createForm.value.serviceIds.includes(service.id))
)

const totalPrice = computed(() =>
  selectedServices.value.reduce((sum, service) => sum + Number(service.price), 0)
)

const totalDuration = computed(() =>
  selectedServices.value.reduce((sum, service) => sum + Number(service.duration || 0), 0)
)

const canLoadSlots = computed(() =>
  Boolean(createForm.value.appointmentDate && totalDuration.value)
)

const setTab = (value) => {
  activeTab.value = value
}

const openDetail = (booking) => {
  selected.value = booking
  showDetail.value = true
}

const filterBookings = () => {}

const resetCreateForm = () => {
  createForm.value = emptyOrderForm()
  createError.value = ''
  slots.value = emptySlots()
}

const fetchBookings = async (showError = true) => {
  loading.value = true
  try {
    const { data } = await api.get('/appointments')
    allBookings.value = data.data
    return true
  } catch (err) {
    if (showError) {
      notice.value = {
        type: 'error',
        message: err.response?.data?.message || 'Failed to load bookings.',
      }
    }
    return false
  } finally {
    loading.value = false
  }
}

const fetchCreateOptions = async () => {
  loadingOptions.value = true
  createError.value = ''

  try {
    const [{ data: serviceData }, { data: stylistData }] = await Promise.all([
      api.get('/services', { params: { activeOnly: true } }),
      api.get('/stylists', { params: { activeOnly: true } }),
    ])

    services.value = serviceData.data || []
    stylists.value = stylistData.data || []
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to load services and stylists.'
  } finally {
    loadingOptions.value = false
  }
}

const fetchAvailableSlots = async () => {
  if (!showCreateForm.value || !canLoadSlots.value) {
    slots.value = emptySlots()
    return
  }

  loadingSlots.value = true
  slots.value = emptySlots()

  try {
    const { data } = await api.get('/slots', {
      params: {
        date: createForm.value.appointmentDate,
        duration: totalDuration.value,
        stylistId: createForm.value.stylistId || undefined,
      },
    })

    slots.value = { ...emptySlots(), ...data.data }
  } catch (err) {
    slots.value = {
      available: false,
      slots: [],
      reason: err.response?.data?.message || 'Failed to load available slots.',
    }
  } finally {
    loadingSlots.value = false
  }
}

const toggleServiceSelection = (serviceId) => {
  if (createForm.value.serviceIds.includes(serviceId)) {
    createForm.value.serviceIds = createForm.value.serviceIds.filter((id) => id !== serviceId)
    return
  }

  createForm.value.serviceIds = [...createForm.value.serviceIds, serviceId]
}

const validateCreateForm = () => {
  if (!createForm.value.customerName.trim()) return 'Customer name is required.'
  if (!createForm.value.customerPhone.trim()) return 'Phone number is required.'
  if (!/^[\d\s+\-()]{7,15}$/.test(createForm.value.customerPhone.trim())) {
    return 'Enter a valid phone number.'
  }
  if (!createForm.value.serviceIds.length) return 'Select at least one service.'
  if (!createForm.value.appointmentDate) return 'Select an appointment date.'
  if (!createForm.value.appointmentTime) return 'Select an available appointment time.'
  return ''
}

const submitManualOrder = async () => {
  const validationError = validateCreateForm()
  if (validationError) {
    createError.value = validationError
    return
  }

  creating.value = true
  createError.value = ''

  try {
    const payload = {
      customerName: createForm.value.customerName.trim(),
      customerPhone: createForm.value.customerPhone.trim(),
      serviceIds: createForm.value.serviceIds,
      appointmentDate: createForm.value.appointmentDate,
      appointmentTime: createForm.value.appointmentTime,
      stylistId: createForm.value.stylistId ? Number(createForm.value.stylistId) : undefined,
      notes: createForm.value.notes.trim() || undefined,
    }

    const { data } = await api.post('/appointments', payload)
    const booking = data.data
    const refreshed = await fetchBookings(false)

    activeTab.value = booking.status || 'PENDING'
    search.value = ''
    showCreateForm.value = false
    notice.value = {
      type: 'success',
      message: refreshed
        ? `Booking ${booking.reference} created successfully.`
        : `Booking ${booking.reference} created successfully. Refresh the page if it does not appear immediately.`,
    }
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create booking.'
  } finally {
    creating.value = false
  }
}

const openCreateModal = async () => {
  resetCreateForm()
  showCreateForm.value = true
  await fetchCreateOptions()
}

const updateStatus = async (booking, status) => {
  try {
    await api.patch(`/appointments/${booking.id}/status`, { status })
    const refreshed = await fetchBookings(false)
    if (!refreshed) {
      notice.value = {
        type: 'error',
        message: 'Booking was updated, but the list could not be refreshed.',
      }
    }
  } catch (err) {
    notice.value = {
      type: 'error',
      message: err.response?.data?.message || 'Failed to update booking status.',
    }
  }
}

const confirmDelete = (booking) => {
  deleteTarget.value = booking
  showDeleteConfirm.value = true
}

const doDelete = async () => {
  if (!deleteTarget.value) return

  deleting.value = true

  try {
    await api.delete(`/appointments/${deleteTarget.value.id}`)
    const deletedReference = deleteTarget.value.reference
    const refreshed = await fetchBookings(false)

    showDeleteConfirm.value = false
    deleteTarget.value = null
    notice.value = {
      type: refreshed ? 'success' : 'error',
      message: refreshed
        ? `Booking ${deletedReference} deleted successfully.`
        : `Booking ${deletedReference} was deleted, but the list could not be refreshed.`,
    }
  } catch (err) {
    notice.value = {
      type: 'error',
      message: err.response?.data?.message || 'Failed to delete booking.',
    }
  } finally {
    deleting.value = false
  }
}

const formatDate = (date) =>
  formatDateOnly(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

watch(
  () => createForm.value.appointmentDate,
  () => {
    createForm.value.appointmentTime = ''
    void fetchAvailableSlots()
  }
)

watch(totalDuration, () => {
  createForm.value.appointmentTime = ''
  void fetchAvailableSlots()
})

watch(
  () => createForm.value.stylistId,
  () => {
    createForm.value.appointmentTime = ''
    void fetchAvailableSlots()
  }
)

watch(showCreateForm, (isOpen) => {
  if (!isOpen) resetCreateForm()
})

onMounted(() => {
  void fetchBookings()
})
</script>
