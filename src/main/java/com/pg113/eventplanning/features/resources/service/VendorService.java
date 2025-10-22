package com.pg113.eventplanning.features.resources.service;

import com.pg113.eventplanning.features.resources.model.Vendor;
import com.pg113.eventplanning.features.resources.repository.VendorRepository;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.model.UserRole;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    // Create vendor profile (owner = logged-in user)
    public Vendor create(Vendor v, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.VENDOR && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only vendor users or admins can create vendor profiles");
        }

        v.setOwner(user);
        return vendorRepository.save(v);
    }

    // List all vendors
    public List<Vendor> findAll() {
        return vendorRepository.findAll();
    }

    // Search vendors
    public List<Vendor> search(String q) {
        return vendorRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(q, q);
    }

    // Find one vendor
    public Vendor findById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    // Update owned vendor (owner or admin only)
    @Transactional
    public Vendor updateOwned(Long id, Vendor data, String username) {
        Vendor existing = findById(id);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = existing.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Not allowed to update this vendor");
        }

        existing.setName(data.getName());
        existing.setCategory(data.getCategory());
        existing.setAddress(data.getAddress());
        existing.setEmail(data.getEmail());
        existing.setPhone(data.getPhone());
        existing.setDescription(data.getDescription());

        return existing;
    }

    // Approve vendor (admin only)
    @Transactional
    public Vendor approve(Long id) {
        Vendor v = findById(id);
        v.setApproved(true);
        return v;
    }

    // Delete vendor (owner or admin only)
    @Transactional
    public void deleteOwned(Long id, String username) {
        Vendor existing = findById(id);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = existing.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Not allowed to delete this vendor");
        }

        vendorRepository.delete(existing);
    }
}
//evenza