import React, { useEffect, useState } from 'react';
import { db } from './lib/neon';

export default function DebugClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesData = await db.getClasses();
        const coursesData = await db.getCourses();
        
        console.log('Classes data:', classesData);
        console.log('Courses data:', coursesData);
        
        setClasses(classesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Debug Classes</h1>
      <h2>Classes:</h2>
      <pre>{JSON.stringify(classes, null, 2)}</pre>
      <h2>Courses:</h2>
      <pre>{JSON.stringify(courses, null, 2)}</pre>
    </div>
  );
}