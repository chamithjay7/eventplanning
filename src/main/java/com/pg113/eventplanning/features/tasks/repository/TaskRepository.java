
package com.pg113.eventplanning.features.tasks.repository;

import com.pg113.eventplanning.features.tasks.model.Task;
import com.pg113.eventplanning.features.tasks.model.TaskStatus;
import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEvent(Event event);
    List<Task> findByAssignedTo(User user);
    List<Task> findByEventAndStatus(Event event, TaskStatus status);
    List<Task> findByEventAndDueDateBefore(Event event, Instant before);
    List<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String t, String d);
}
//TaskRepository