import { useEffect, useState } from 'react';
import type Group from '../types/Group';
import { db } from '../Firebase';
import { onValue, ref } from 'firebase/database';
import { GroupProfile } from '../types/Group';

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const groupsRef = ref(db, '/groups');

    // onValue returns an unsubscribe function directly
    const unsubscribe = onValue(
      groupsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const groupsList: Group[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key]
          }));

          groupsList.sort((a, b) => a.name.localeCompare(b.name))
          setGroups(groupsList);
        } else {
          setGroups([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firebase read error: ', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-4">Loading games...</div>;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupProfile key={group.id} group={group} />
      ))}
    </div>
  );
}