import { Block, BlockTitle, List, ListItem } from 'framework7-react';
import { useStatsViewModel } from '../../../context.ts';
import { useObservable } from '../../../hooks.ts';
import WeekDots from '../components/WeekDots.tsx';

export default function StatsScreen() {
  const { tiles, items } = useObservable(useStatsViewModel());

  return (
    <>
      <div className="stats-grid">
        {tiles.map((tile) => (
          <div key={tile.label} className="stat-tile">
            <div className="stat-value">{tile.value}</div>
            <div className="stat-label">{tile.label}</div>
          </div>
        ))}
      </div>

      <BlockTitle>Habits</BlockTitle>
      {items.length === 0 ? (
        <Block strong className="empty-hint">No habits yet.</Block>
      ) : (
        <List strong inset>
          {items.map((item) => (
            <ListItem key={item.id}>
              <span slot="media" className="habit-emoji-lg" aria-hidden="true">{item.emoji}</span>
              <span slot="title">{item.name}</span>
              <div slot="inner" className="habit-week-wrap">
                <span className="habit-sub">{item.summary}</span>
                <WeekDots days={item.days} />
              </div>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
