package com.pg113.eventplanning.features.resources.service;

import com.pg113.eventplanning.features.resources.model.Venue;
import com.pg113.eventplanning.features.resources.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    public Venue create(Venue v) {
        return venueRepository.save(v);
    }

    public List<Venue> findAll() {
        return venueRepository.findAll();
    }

    public Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    public List<Venue> search(String q) {
        return venueRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(q, q);
    }

    @Transactional
    public Venue update(Long id, Venue data) {
        Venue v = findById(id);
        v.setName(data.getName());
        v.setAddress(data.getAddress());
        v.setDescription(data.getDescription());
        v.setCapacity(data.getCapacity());
        return v;
    }

    @Transactional
    public Venue approve(Long id) {
        Venue v = findById(id);
        v.setApproved(true);
        return v;
    }

    public void delete(Long id) {
        venueRepository.deleteById(id);
    }
}
//evenza