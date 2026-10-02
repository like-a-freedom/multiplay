// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { CalendarDate } from '@/domain/learning/calendarDate'
import MissionScreen from '@/presentation/screens/MissionScreen.vue'
import { today } from '@/presentation/utils/clock'
import { fakeGameSession, sessionMountOptions } from '../../../tests/support/fakeGameSession'

function mountMission(session = fakeGameSession()) {
  return mount(MissionScreen, sessionMountOptions(session))
}

function seededMissionSession(cardFactIds: readonly string[] = ['0:0', '0:1']) {
  const session = fakeGameSession()
  session.state.value = {
    ...session.state.value,
    currentMission: { id: 'seeded-mission', cardFactIds, answeredFactIds: [] },
  }
  return session
}

const buttons = (wrapper: ReturnType<typeof mountMission>) => wrapper.findAll('button')

async function answer(wrapper: ReturnType<typeof mountMission>, value: string) {
  const input = wrapper.get('input')
  await input.setValue(value)
  const check = buttons(wrapper).find((b) => b.text() === 'Проверить')
  expect(check).toBeDefined()
  await check!.trigger('click')
}

describe('MissionScreen answer flow', () => {
  it('accepts the correct answer typed into the field (repro: 0 for 0×0 and 0×1)', async () => {
    const wrapper = mountMission(seededMissionSession())
    await wrapper.vm.$nextTick()

    // The first seeded card is 0 × 0.
    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Верно')
    expect(wrapper.emitted('star-unlocked')).toBeUndefined()

    await buttons(wrapper).find((b) => b.text() === 'Продолжить')!.trigger('click')
    await wrapper.vm.$nextTick()

    // The second seeded card is 0 × 1.
    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Верно')
    wrapper.unmount()
  })

  it('marks a wrong answer wrong, keeps the typed value and names it in the feedback', async () => {
    const wrapper = mountMission(seededMissionSession(['0:0']))
    await wrapper.vm.$nextTick()

    await answer(wrapper, '1')
    expect(wrapper.text()).toContain('Разберём вместе')
    expect(wrapper.text()).toContain('Твой ответ: 1')
    expect(wrapper.text()).toContain('Верный ответ: 0')
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('.question-card--review').exists()).toBe(true)
    wrapper.unmount()
  })

  it('hides the answer field after a correct answer', async () => {
    const wrapper = mountMission(seededMissionSession(['0:0']))
    await wrapper.vm.$nextTick()

    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Верно')
    expect(wrapper.find('input').exists()).toBe(false)
    wrapper.unmount()
  })

  it('submits the answer on Enter from the field', async () => {
    const wrapper = mountMission(seededMissionSession(['0:0']))
    await wrapper.vm.$nextTick()

    const input = wrapper.get('input')
    await input.setValue('0')
    await input.trigger('keyup.enter')
    expect(wrapper.text()).toContain('Верно')
    wrapper.unmount()
  })

  it('resumes the unfinished mission with its frozen queue and id (PRD M4, §7)', async () => {
    const session = seededMissionSession()
    const first = mountMission(session)
    await first.vm.$nextTick()

    await answer(first, '0') // Answer 0 × 0.
    await buttons(first).find((b) => b.text() === 'Продолжить')!.trigger('click')
    await first.vm.$nextTick()
    first.unmount() // Close the screen mid-mission.

    const second = mountMission(session)
    await second.vm.$nextTick()
    expect(second.text()).toContain('Карточка 2 из 2') // The original queue and prior result are preserved.
    expect(second.get('[aria-label="Карточка 1: Верно"]').attributes('data-outcome')).toBe('correct')

    await answer(second, '0')
    expect(second.text()).toContain('Верно')
    await buttons(second).find((b) => b.text() === 'Продолжить')!.trigger('click')
    expect(second.text()).toContain('Миссия завершена!')
    // The resumed mission keeps its ID and cannot pay its reward twice.
    expect(session.totalXp.value).toBe(10)
    second.unmount()
  })

  it('resumes an explicitly saved, non-sorted queue without recomposition', async () => {
    const session = seededMissionSession(['4:7', '2:5'])
    const first = mountMission(session)
    await first.vm.$nextTick()
    expect(first.get('.question-card--front .question-card__expression').text()).toContain('4 × 7')
    await answer(first, '28')
    await buttons(first).find((button) => button.text() === 'Продолжить')!.trigger('click')
    await first.vm.$nextTick()
    expect(first.get('.question-card--front .question-card__expression').text()).toContain('2 × 5')
    first.unmount()

    const resumed = mountMission(session)
    await resumed.vm.$nextTick()
    expect(resumed.get('.question-card--front .question-card__expression').text()).toContain('2 × 5')
    resumed.unmount()
  })

  it('announces a new star on its answer and links the mission finish to the map', async () => {
    const session = fakeGameSession()
    const savedStarIds: string[] = []
    session.save = () => {
      if (session.state.value.facts['0:0'].mastery.hasStar) savedStarIds.push('0:0')
      return true
    }
    const initial = session.state.value
    session.state.value = {
      ...initial,
      facts: {
        ...initial.facts,
        '0:0': {
          ...initial.facts['0:0'],
          status: 'familiar',
          mastery: { independentSuccessDates: ['2020-01-01'], hasStar: false, needsReview: false },
        },
      },
      currentMission: { id: 'star-mission', cardFactIds: ['0:0'], answeredFactIds: [] },
    }
    const wrapper = mountMission(session)
    await wrapper.vm.$nextTick()
    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Новая звезда открыта на карте!')
    expect(session.stars.value).toBe(1)
    expect(savedStarIds).toEqual(['0:0'])
    expect(wrapper.emitted('star-unlocked')).toEqual([['0:0']])
    await buttons(wrapper).find((b) => b.text() === 'Продолжить')!.trigger('click')
    expect(wrapper.text()).toContain('Звёзды знаний: 1 из 66')
    expect(wrapper.text()).toContain('Всего 10 XP · уровень 1')
    await buttons(wrapper).find((b) => b.text() === 'Карта звёзд')!.trigger('click')
    expect(wrapper.emitted('map')).toHaveLength(1)
    wrapper.unmount()
  })

  it('explains why the fourth completed mission gives no new XP', async () => {
    const session = fakeGameSession()
    session.state.value = {
      ...session.state.value,
      rewards: {
        ...session.state.value.rewards,
        totalXp: 30,
        completions: [1, 2, 3].map((index) => ({ missionId: `prior-${index}`, date: today() })),
      },
      currentMission: { id: 'fourth-mission', cardFactIds: ['0:0'], answeredFactIds: [] },
    }
    const wrapper = mountMission(session)
    await wrapper.vm.$nextTick()
    await answer(wrapper, '0')
    await buttons(wrapper).find((b) => b.text() === 'Продолжить')!.trigger('click')
    expect(wrapper.text()).toContain('+0 XP')
    expect(wrapper.text()).toContain('Дневные 30 XP уже получены')
    expect(session.totalXp.value).toBe(30)
    expect(wrapper.get('[role="status"]').attributes('aria-label')).toContain('+0 XP')
    expect(wrapper.get('[role="status"]').attributes('aria-label')).toContain('Дневные 30 XP уже получены')
    expect(wrapper.find('.xp-award__visual').exists()).toBe(false)
    wrapper.unmount()
  })

  it('announces the final +10 XP immediately while the visual number is separate', async () => {
    const session = fakeGameSession()
    session.state.value = {
      ...session.state.value,
      currentMission: { id: 'ten-xp', cardFactIds: ['0:0'], answeredFactIds: [] },
    }
    const wrapper = mountMission(session)
    await wrapper.vm.$nextTick()

    await answer(wrapper, '0')
    await buttons(wrapper).find((button) => button.text() === 'Продолжить')!.trigger('click')

    const award = wrapper.get('[role="status"]')
    expect(award.attributes('aria-label')).toContain('+10 XP')
    expect(award.attributes('aria-label')).toContain('Всего 10 XP')
    expect(wrapper.get('.xp-award__visual').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('Звёзды знаний: 0 из 66')
    wrapper.unmount()
  })

  it('announces a +20 streak bonus separately when it carries the ship from 90 to 120 XP', async () => {
    const session = fakeGameSession()
    const date = today()
    session.state.value = {
      ...session.state.value,
      rewards: {
        ...session.state.value.rewards,
        totalXp: 90,
        streak: {
          days: 2,
          bestDays: 2,
          lastRewardedDate: dayBefore(date),
          earnedMilestoneDays: [],
        },
      },
      currentMission: { id: 'streak-milestone', cardFactIds: ['0:0'], answeredFactIds: [] },
    }
    const wrapper = mountMission(session)
    await wrapper.vm.$nextTick()

    await answer(wrapper, '0')
    await buttons(wrapper).find((button) => button.text() === 'Продолжить')!.trigger('click')

    const award = wrapper.get('[role="status"]')
    expect(award.attributes('aria-label')).toContain('+30 XP')
    expect(award.attributes('aria-label')).toContain('10 XP за миссию')
    expect(award.attributes('aria-label')).toContain('20 XP за серию дней')
    expect(award.attributes('aria-label')).toContain('Всего 120 XP')
    expect(award.attributes('aria-label')).toContain('Уровень 2')
    expect(session.totalXp.value).toBe(120)
    wrapper.unmount()
  })

  it('keeps a clock-rollback reward at +0 XP and explains the pause', async () => {
    const session = fakeGameSession()
    session.state.value = {
      ...session.state.value,
      rewards: {
        ...session.state.value.rewards,
        totalXp: 30,
        streak: {
          days: 3,
          bestDays: 3,
          lastRewardedDate: dayAfter(today()),
          earnedMilestoneDays: [3],
        },
      },
      currentMission: { id: 'clock-rollback', cardFactIds: ['0:0'], answeredFactIds: [] },
    }
    const wrapper = mountMission(session)
    await wrapper.vm.$nextTick()

    await answer(wrapper, '0')
    await buttons(wrapper).find((button) => button.text() === 'Продолжить')!.trigger('click')

    expect(wrapper.get('[role="status"]').attributes('aria-label')).toContain('+0 XP')
    expect(wrapper.get('[role="status"]').attributes('aria-label')).toContain('приостановлены из-за даты устройства')
    expect(wrapper.find('.xp-award__visual').exists()).toBe(false)
    expect(session.totalXp.value).toBe(30)
    wrapper.unmount()
  })
})

function dayBefore(date: CalendarDate): CalendarDate {
  const value = new Date(`${date}T12:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() - 1)
  return value.toISOString().slice(0, 10) as CalendarDate
}

function dayAfter(date: CalendarDate): CalendarDate {
  const value = new Date(`${date}T12:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() + 1)
  return value.toISOString().slice(0, 10) as CalendarDate
}
